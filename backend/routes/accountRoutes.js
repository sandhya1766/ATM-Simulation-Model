const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
const { withdrawalRules, depositRules, transferRules, changePinRules } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/balance', apiLimiter, protect, accountController.getBalance);
router.post('/withdraw', apiLimiter, protect, withdrawalRules, accountController.withdraw);
router.post('/deposit', apiLimiter, protect, depositRules, accountController.deposit);
router.post('/transfer', apiLimiter, protect, transferRules, accountController.transfer);
router.post('/change-pin', apiLimiter, protect, changePinRules, accountController.changePin);
router.get('/history', apiLimiter, protect, accountController.getHistory);
router.post('/cheque-request', apiLimiter, protect, accountController.requestChequeBook);
router.post('/update-kyc', apiLimiter, protect, accountController.updateKyc);
router.post('/lock-card', apiLimiter, protect, accountController.lockCard);

module.exports = router;
