const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['card_blocked', 'kyc_submitted', 'cheque_requested', 'large_withdrawal', 'security_alert'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  roles: {
    type: [String],
    default: ['admin', 'super-admin']
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
