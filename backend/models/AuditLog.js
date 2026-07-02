const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cardNumber: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['auth', 'transaction', 'security', 'admin', 'system'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
