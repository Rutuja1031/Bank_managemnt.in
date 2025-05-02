const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

exports.transfer = async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, description } = req.body;
        
        // Find source account by ID
        const sourceAccount = await Account.findOne({ 
            _id: fromAccount,
            userId: req.user.userId 
        });

        if (!sourceAccount) {
            return res.status(404).json({ error: 'Source account not found' });
        }

        // Find destination account by account number
        const destinationAccount = await Account.findOne({ accountNumber: toAccount });
        if (!destinationAccount) {
            return res.status(404).json({ error: 'Destination account not found' });
        }

        if (sourceAccount.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Create transaction
        const transaction = new Transaction({
            fromAccount: sourceAccount._id,
            toAccount: destinationAccount._id,
            amount,
            description,
            type: 'transfer'
        });

        // Update account balances
        sourceAccount.balance -= amount;
        destinationAccount.balance += amount;

        await Promise.all([
            transaction.save(),
            sourceAccount.save(),
            destinationAccount.save()
        ]);

        res.json({ message: 'Transfer successful', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const userAccounts = await Account.find({ userId: req.user.userId }).select('_id');
        const accountIds = userAccounts.map(account => account._id);

        const transactions = await Transaction.find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('fromAccount toAccount')
        .exec();

        const formattedTransactions = transactions.map(t => ({
            date: t.createdAt,
            type: t.type,
            fromAccount: t.fromAccount ? t.fromAccount.accountNumber : 'N/A',
            toAccount: t.toAccount ? t.toAccount.accountNumber : 'N/A',
            description: t.description,
            amount: t.amount
        }));

        res.json(formattedTransactions);
    } catch (error) {
        console.error('Transaction fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

exports.getRecentTransactions = async (req, res) => {
    try {
        const userAccounts = await Account.find({ userId: req.user.userId }).select('_id');
        const accountIds = userAccounts.map(account => account._id);

        const transactions = await Transaction.find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('fromAccount toAccount');

        const formattedTransactions = transactions.map(t => ({
            fromAccount: t.fromAccount.accountNumber,
            toAccount: t.toAccount.accountNumber,
            amount: t.amount,
            description: t.description,
            date: t.createdAt,
            type: t.type
        }));

        res.json(formattedTransactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};