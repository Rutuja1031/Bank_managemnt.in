const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { generateAccountNumber } = require('../utils/helpers');

exports.createAccount = async (req, res) => {
    try {
        const { accountType, initialDeposit } = req.body;
        
        const accountNumber = await generateAccountNumber();
        
        const account = new Account({
            userId: req.user.userId,
            accountNumber,
            accountType,
            balance: initialDeposit
        });

        await account.save();

        // Create initial deposit transaction
        const transaction = new Transaction({
            toAccount: account._id,
            amount: initialDeposit,
            type: 'deposit',
            description: 'Initial deposit'
        });

        await transaction.save();

        res.status(201).json({ account, transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user.userId });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAccountDetails = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const recentTransactions = await Transaction.find({
            $or: [
                { fromAccount: account._id },
                { toAccount: account._id }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(5);

        res.json({ account, recentTransactions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.closeAccount = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (account.balance > 0) {
            return res.status(400).json({ error: 'Account must have zero balance before closing' });
        }

        await account.remove();
        res.json({ message: 'Account closed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bill payment functionality
exports.payBill = async (req, res) => {
    try {
        const { accountId, billType, amount, billReference } = req.body;
        
        const account = await Account.findOne({
            _id: accountId,
            userId: req.user.userId
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (account.balance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Create bill payment transaction
        const transaction = new Transaction({
            fromAccount: account._id,
            amount,
            type: 'bill_payment',
            description: `Bill payment - ${billType} - Ref: ${billReference}`
        });

        account.balance -= amount;

        await Promise.all([
            transaction.save(),
            account.save()
        ]);

        res.json({ message: 'Bill payment successful', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};