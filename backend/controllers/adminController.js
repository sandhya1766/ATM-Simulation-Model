const User = require('../models/User');
const Card = require('../models/Card');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// 1. Get Dashboard Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalCards = await Card.countDocuments();
    const blockedCards = await Card.countDocuments({ status: 'blocked' });
    const activeCards = await Card.countDocuments({ status: 'active' });
    
    // Sum total system balance
    const balanceStats = await Account.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
    ]);
    const totalBalance = balanceStats.length > 0 ? balanceStats[0].totalBalance : 0;

    // Daily Transaction summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const withdrawalsCount = await Transaction.countDocuments({
      type: 'withdrawal',
      createdAt: { $gte: today }
    });

    const depositsCount = await Transaction.countDocuments({
      type: 'deposit',
      createdAt: { $gte: today }
    });

    const transfersCount = await Transaction.countDocuments({
      type: 'transfer',
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalCards,
        activeCards,
        blockedCards,
        totalBalance,
        todayActivity: {
          withdrawals: withdrawalsCount,
          deposits: depositsCount,
          transfers: transfersCount
        }
      }
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 2. Manage Customers - List & Details
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    
    // Fetch accounts and cards matching customers
    const formattedCustomers = [];
    for (const cust of customers) {
      const account = await Account.findOne({ user: cust._id });
      const card = await Card.findOne({ user: cust._id });
      
      formattedCustomers.push({
        id: cust._id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        status: cust.status,
        kycStatus: cust.kycStatus,
        createdAt: cust.createdAt,
        account: account ? {
          accountNumber: account.accountNumber,
          balance: account.balance,
          status: account.status
        } : null,
        card: card ? {
          cardNumber: card.cardNumber,
          status: card.status,
          failedAttempts: card.failedAttempts,
          dailyLimit: card.dailyLimit
        } : null
      });
    }

    res.status(200).json({ success: true, customers: formattedCustomers });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 3. KYC Verification - Review & Update Status
exports.reviewKyc = async (req, res) => {
  try {
    const { userId, docId, status } = req.body; // status: 'approved' or 'rejected'
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find and update document status
    const doc = user.kycDocuments.id(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    doc.status = status;

    // If any document is rejected, KYC status is rejected. If all approved, KYC status approved.
    const hasRejected = user.kycDocuments.some(d => d.status === 'rejected');
    const allApproved = user.kycDocuments.every(d => d.status === 'approved');

    if (hasRejected) {
      user.kycStatus = 'rejected';
    } else if (allApproved) {
      user.kycStatus = 'approved';
    } else {
      user.kycStatus = 'pending';
    }

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: `kyc_review_${status}`,
      category: 'admin',
      status: 'success',
      details: { targetUserId: userId, docType: doc.type },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `KYC document status updated to ${status} successfully.`,
      kycStatus: user.kycStatus
    });
  } catch (error) {
    console.error('Error in reviewKyc:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 4. Freeze/Unfreeze Account or Card
exports.toggleFreezeStatus = async (req, res) => {
  try {
    const { type, id, action } = req.body; // type: 'account' or 'card', action: 'freeze' or 'unfreeze'
    
    if (type === 'account') {
      const account = await Account.findById(id).populate('user');
      if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

      account.status = action === 'freeze' ? 'frozen' : 'active';
      await account.save();

      await AuditLog.create({
        user: req.user._id,
        action: `account_${action}`,
        category: 'admin',
        status: 'success',
        details: { targetAccountId: id, targetUser: account.user.name },
        ipAddress: req.ip
      });

    } else if (type === 'card') {
      const card = await Card.findById(id).populate('user');
      if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

      card.status = action === 'freeze' ? 'locked' : 'active';
      if (action === 'unfreeze') card.failedAttempts = 0; // reset failures if unblocked/unlocked by admin
      await card.save();

      await AuditLog.create({
        user: req.user._id,
        action: `card_${action}`,
        category: 'admin',
        status: 'success',
        details: { targetCardId: id, targetUser: card.user.name },
        ipAddress: req.ip
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid target type.' });
    }

    res.status(200).json({ success: true, message: `Target ${type} successfully ${action}d.` });
  } catch (error) {
    console.error('Error in toggleFreezeStatus:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 5. Get System Notifications for Admins
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      roles: { $in: [req.user.role] }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 6. Mark Notification as Read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 7. Get All Transactions List
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email phone')
      .populate('account', 'accountNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error('Error in getAllTransactions:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
