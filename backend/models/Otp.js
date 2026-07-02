const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['login', 'transfer', 'pin_change'],
    default: 'login'
  },
  code: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 // Expire document after 60 seconds (TTL index)
  }
});

module.exports = mongoose.model('Otp', OtpSchema);
