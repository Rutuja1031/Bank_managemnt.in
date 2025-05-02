const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');

router.post('/create', auth, accountController.createAccount);
router.get('/', auth, accountController.getAccounts);
router.get('/:id', auth, accountController.getAccountDetails);
router.delete('/:id', auth, accountController.closeAccount);
router.post('/pay-bill', auth, accountController.payBill);

module.exports = router;