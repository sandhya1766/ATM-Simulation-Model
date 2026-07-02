const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  expiryDate: {
    type: String, // MM/YY format
    required: true,
    trim: true
  },
  pin: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'locked', 'blocked'], // locked = temp, blocked = permanent
    default: 'active'
  },
  failedAttempts: {
    type: Number,
    default: 0
  },
  blockReason: {
    type: String,
    default: ''
  },
  dailyLimit: {
    type: Number,
    default: 50000 // Limit in standard currency
  },
  dailyWithdrawn: {
    type: Number,
    default: 0
  },
  lastLimitReset: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to hash the PIN before saving
CardSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to verify PIN
CardSchema.methods.comparePin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('Card', CardSchema);
