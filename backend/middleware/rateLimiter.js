const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict login/OTP rate limiter
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };
