const Account = require('../models/Account');

exports.generateAccountNumber = async () => {
    let accountNumber;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random 10-digit number
        accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        
        // Check if it's unique
        const existingAccount = await Account.findOne({ accountNumber });
        if (!existingAccount) {
            isUnique = true;
        }
    }

    return accountNumber;
};

exports.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

exports.generateTransactionReference = () => {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};