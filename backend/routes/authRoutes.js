const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginCardRules, loginPinRules, verifyOtpRules } = require('../middleware/validate');

router.post('/check-card', authLimiter, loginCardRules, authController.checkCard);
router.post('/verify-pin', authLimiter, loginPinRules, authController.verifyPin);
router.post('/verify-otp', authLimiter, verifyOtpRules, authController.verifyOtp);
router.post('/admin-login', authLimiter, authController.adminLogin);
router.post('/logout', protect, authController.logout);

module.exports = router;
