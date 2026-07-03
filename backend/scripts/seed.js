const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Otp = require('../models/Otp');
const Session = require('../models/Session');
require('dotenv').config();

const seedData = async () => {
  try {

    // Connect only if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000
      });
      console.log('MongoDB Connected');
    }

    // Clear old data
    await Promise.all([
      User.deleteMany({}),
      Card.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      Otp.deleteMany({}),
      Session.deleteMany({})
    ]);

    console.log('Old data removed');

    // ==========================
    // CUSTOMER
    // ==========================

    const customerUser = await User.create({
      name: "Sandhya Sharma",
      email: "sandhya@example.com",
      phone: "+919876543210",
      role: "customer",
      status: "active",
      kycStatus: "approved",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    });

    const customerCard = await Card.create({
      user: customerUser._id,
      cardNumber: "1234567812345678",
      expiryDate: "12/28",
      pin: "1234",
      status: "active",
      dailyLimit: 50000,
      dailyWithdrawn: 0
    });

    const customerAccount = await Account.create({
      user: customerUser._id,
      card: customerCard._id,
      accountNumber: "987654321098",
      accountType: "Savings",
      balance: 75000,
      ledgerBalance: 75000,
      minBalance: 1000,
      branch: "Main Branch"
    });

    console.log("Customer created");

    // ==========================
    // ADMIN
    // ==========================

    await User.create({
      name: "Manager Rahul Kumar",
      email: "admin@banking.com",
      password: "adminpassword",
      phone: "+919999988888",
      role: "admin",
      status: "active",
      kycStatus: "approved"
    });

    await User.create({
      name: "Director Vikram Mehta",
      email: "super@banking.com",
      password: "superpassword",
      phone: "+918888877777",
      role: "super-admin",
      status: "active",
      kycStatus: "approved"
    });

    console.log("Admins created");

    // ==========================
    // SAMPLE TRANSACTION
    // ==========================

    await Transaction.create({
      user: customerUser._id,
      account: customerAccount._id,
      transactionId: "TXN100001",
      refNumber: "100000000001",
      type: "deposit",
      amount: 75000,
      balanceAfter: 75000,
      description: "Opening Balance",
      status: "success"
    });

    await AuditLog.create({
      user: customerUser._id,
      cardNumber: customerCard.cardNumber,
      action: "account_created",
      category: "system",
      status: "success",
      details: {
        accountId: customerAccount._id
      },
      ipAddress: "127.0.0.1"
    });

    console.log("Database Seeded Successfully");

    return {
      success: true,
      message: "Database seeded successfully"
    };

  } catch (err) {

    console.error(err);

    throw err;

  } finally {

    if (require.main === module) {
      await mongoose.connection.close();
    }

  }
};

// Export for server.js
module.exports = seedData;

// Allow standalone execution
if (require.main === module) {

  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));

}