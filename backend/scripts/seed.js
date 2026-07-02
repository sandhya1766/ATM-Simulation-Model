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
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-atm');
    console.log('Database connected for seeding...');

    // Clear old data
    await User.deleteMany();
    await Card.deleteMany();
    await Account.deleteMany();
    await Transaction.deleteMany();
    await AuditLog.deleteMany();
    await Notification.deleteMany();
    await Otp.deleteMany();
    await Session.deleteMany();

    console.log('Cleared existing collections.');

    // 1. Create Customer User
    const customerUser = await User.create({
      name: 'Sandhya Sharma',
      email: 'sandhya@example.com',
      phone: '+919876543210',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Mock female user photo
      role: 'customer',
      status: 'active',
      kycStatus: 'approved',
      kycDocuments: [
        {
          type: 'PAN',
          fileUrl: '/uploads/kyc_pan_dummy.pdf',
          status: 'approved',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          type: 'Aadhar',
          fileUrl: '/uploads/kyc_aadhar_dummy.pdf',
          status: 'approved',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    // 2. Create Card for Customer (PIN: 1234)
    const customerCard = await Card.create({
      user: customerUser._id,
      cardNumber: '1234567812345678',
      expiryDate: '12/28',
      pin: '1234', // hashed automatically by Mongoose pre-save
      status: 'active',
      dailyLimit: 50000,
      dailyWithdrawn: 0
    });

    // 3. Create Account for Customer
    const customerAccount = await Account.create({
      user: customerUser._id,
      card: customerCard._id,
      accountNumber: '987654321098',
      accountType: 'Savings',
      balance: 75000,
      ledgerBalance: 75000,
      minBalance: 1000,
      branch: 'Silicon Valley Premium Branch'
    });

    // Link Account inside Card if required, or simply save card
    console.log('Seeded Customer, Card, and Account.');

    // 4. Create Bank Admin (password: adminpassword)
    const bankAdmin = await User.create({
      name: 'Manager Rahul Kumar',
      email: 'admin@banking.com',
      phone: '+919999988888',
      role: 'admin',
      status: 'active',
      password: 'adminpassword', // hashed automatically by Mongoose pre-save
      kycStatus: 'approved'
    });

    // 5. Create Super Admin (password: superpassword)
    const superAdmin = await User.create({
      name: 'Director Vikram Mehta',
      email: 'super@banking.com',
      phone: '+918888877777',
      role: 'super-admin',
      status: 'active',
      password: 'superpassword', // hashed automatically by Mongoose pre-save
      kycStatus: 'approved'
    });

    console.log('Seeded Admin & Super Admin.');

    // 6. Create initial transactions for Customer
    const txs = [
      {
        type: 'deposit',
        amount: 50000,
        desc: 'Opening Cash Deposit',
        daysAgo: 10,
        balAfter: 50000
      },
      {
        type: 'withdrawal',
        amount: 5000,
        desc: 'ATM Cash Withdrawal',
        daysAgo: 7,
        balAfter: 45000
      },
      {
        type: 'transfer',
        amount: 10000,
        desc: 'Transfer to Mohit Sharma via UPI',
        daysAgo: 4,
        balAfter: 35000,
        details: { beneficiaryName: 'Mohit Sharma', upiId: 'mohit@upi' }
      },
      {
        type: 'deposit',
        amount: 45000,
        desc: 'Salary Credit - NEFT',
        daysAgo: 2,
        balAfter: 80000,
        details: { denominations: { 500: 90 } }
      },
      {
        type: 'withdrawal',
        amount: 5000,
        desc: 'ATM Cash Withdrawal',
        daysAgo: 1,
        balAfter: 75000
      }
    ];

    for (const tx of txs) {
      const txId = 'TXN' + Math.floor(100000000 + Math.random() * 900000000);
      const ref = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      await Transaction.create({
        user: customerUser._id,
        account: customerAccount._id,
        transactionId: txId,
        refNumber: ref,
        type: tx.type,
        amount: tx.amount,
        balanceAfter: tx.balAfter,
        description: tx.desc,
        status: 'success',
        details: tx.details || {},
        createdAt: new Date(Date.now() - tx.daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Seed a sample Audit Log
    await AuditLog.create({
      user: customerUser._id,
      cardNumber: customerCard.cardNumber,
      action: 'account_created',
      category: 'system',
      status: 'success',
      details: { accountId: customerAccount._id },
      ipAddress: '127.0.0.1'
    });

    console.log('Seeded transaction history.');
    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedData();
