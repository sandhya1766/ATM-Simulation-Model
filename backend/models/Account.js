const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current'],
    default: 'Savings'
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  ledgerBalance: {
    type: Number,
    required: true,
    default: 0
  },
  minBalance: {
    type: Number,
    default: 1000 // Minimum balance requirement
  },
  branch: {
    type: String,
    required: true,
    default: 'Main Branch'
  },
  status: {
    type: String,
    enum: ['active', 'frozen'],
    default: 'active'
  },
  chequeBookRequests: [{
    requestId: String,
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['requested', 'dispatched', 'delivered'], default: 'requested' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', AccountSchema);
