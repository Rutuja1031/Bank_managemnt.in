const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/', auth, transactionController.getTransactions);
router.get('/recent', auth, transactionController.getRecentTransactions);
router.post('/transfer', auth, transactionController.transfer);

module.exports = router;