const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  refNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['withdrawal', 'deposit', 'transfer', 'pin_change', 'cheque_request', 'kyc_update', 'card_lock'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  details: {
    beneficiaryAccount: String,
    beneficiaryName: String,
    upiId: String,
    ifsc: String,
    notes: String,
    denominations: {
      500: Number,
      2000: Number,
      100: Number // support general denominations
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
