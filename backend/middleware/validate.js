const { body, validationResult } = require('express-validator');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const loginCardRules = [
  body('cardNumber')
    .notEmpty().withMessage('Card number is required')
    .isLength({ min: 16, max: 19 }).withMessage('Card number must be between 16 and 19 digits')
    .isNumeric().withMessage('Card number must contain digits only'),
  body('expiryDate')
    .notEmpty().withMessage('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/).withMessage('Expiry date must be in MM/YY format'),
  validateResult
];

const loginPinRules = [
  body('cardNumber')
    .notEmpty().withMessage('Card number is required'),
  body('pin')
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
    .isNumeric().withMessage('PIN must contain digits only'),
  validateResult
];

const verifyOtpRules = [
  body('cardNumber')
    .notEmpty().withMessage('Card number is required'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain digits only'),
  validateResult
];

const withdrawalRules = [
  body('amount')
    .notEmpty().withMessage('Withdrawal amount is required')
    .isInt({ min: 100, max: 20000 }).withMessage('Amount must be between 100 and 20000')
    .custom((value) => {
      if (value % 100 !== 0) {
        throw new Error('Amount must be a multiple of 100');
      }
      return true;
    }),
  validateResult
];

const depositRules = [
  body('denominations')
    .notEmpty().withMessage('Denominations are required')
    .isObject().withMessage('Denominations must be an object'),
  validateResult
];

const transferRules = [
  body('type')
    .isIn(['account', 'upi', 'mobile']).withMessage('Invalid transfer method'),
  body('amount')
    .notEmpty().withMessage('Transfer amount is required')
    .isFloat({ min: 10, max: 100000 }).withMessage('Amount must be between 10 and 100000'),
  body('beneficiaryName')
    .notEmpty().withMessage('Beneficiary name is required'),
  body('target')
    .notEmpty().withMessage('Target identifier (Account / UPI / Phone) is required'),
  validateResult
];

const changePinRules = [
  body('currentPin')
    .notEmpty().withMessage('Current PIN is required')
    .isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
    .isNumeric().withMessage('PIN must contain digits only'),
  body('newPin')
    .notEmpty().withMessage('New PIN is required')
    .isLength({ min: 4, max: 4 }).withMessage('PIN must be 4 digits')
    .isNumeric().withMessage('PIN must contain digits only'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6-digits'),
  validateResult
];

module.exports = {
  loginCardRules,
  loginPinRules,
  verifyOtpRules,
  withdrawalRules,
  depositRules,
  transferRules,
  changePinRules
};
