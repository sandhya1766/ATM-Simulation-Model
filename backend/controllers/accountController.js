const { v4: uuidv4 } = require('uuid');
const Account = require('../models/Account');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');
const Otp = require('../models/Otp');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper to generate transaction IDs
const generateTxIds = () => {
  const transactionId = 'TXN' + Math.floor(100000000 + Math.random() * 900000000);
  const refNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  return { transactionId, refNumber };
};

// 1. Balance Inquiry
exports.getBalance = async (req, res) => {
  try {
    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found for this card' });
    }

    await AuditLog.create({
      user: req.user._id,
      cardNumber: req.card.cardNumber,
      action: 'balance_inquiry',
      category: 'transaction',
      status: 'success',
      details: { balance: account.balance },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      balance: account.balance,
      availableBalance: account.balance - account.minBalance > 0 ? account.balance - account.minBalance : 0,
      ledgerBalance: account.ledgerBalance,
      minBalance: account.minBalance,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error in getBalance:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 2. Cash Withdrawal
exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = parseInt(amount, 10);

    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Account is frozen. Transactions disabled.' });
    }

    // Rule 1: Cannot withdraw below minimum balance
    if (account.balance - numericAmount < account.minBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Minimum balance of ${account.minBalance} must be maintained.`
      });
    }

    // Rule 2: Cannot exceed daily limit
    const card = req.card;
    const today = new Date().toDateString();
    
    // Reset daily withdrawn counter if date has changed
    if (new Date(card.lastLimitReset).toDateString() !== today) {
      card.dailyWithdrawn = 0;
      card.lastLimitReset = new Date();
    }

    if (card.dailyWithdrawn + numericAmount > card.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: `Daily withdrawal limit exceeded. Remaining daily limit: ${card.dailyLimit - card.dailyWithdrawn}`
      });
    }

    // Deduct balance and update card limits
    account.balance -= numericAmount;
    account.ledgerBalance -= numericAmount;
    card.dailyWithdrawn += numericAmount;

    await account.save();
    await card.save();

    const { transactionId, refNumber } = generateTxIds();

    // Calculate simulated note dispensing (favoring 500 first, then 100, etc.)
    let rem = numericAmount;
    const notesDispensed = { 500: 0, 100: 0 };
    if (rem >= 500) {
      notesDispensed[500] = Math.floor(rem / 500);
      rem = rem % 500;
    }
    if (rem >= 100) {
      notesDispensed[100] = Math.floor(rem / 100);
      rem = rem % 100;
    }

    // Generate Transaction Record
    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'withdrawal',
      amount: numericAmount,
      balanceAfter: account.balance,
      description: 'ATM Cash Withdrawal',
      status: 'success',
      details: {
        denominations: notesDispensed
      }
    });

    // Notify if withdrawal is large (e.g. >= 10000)
    if (numericAmount >= 10000) {
      await Notification.create({
        type: 'large_withdrawal',
        message: `Large cash withdrawal of ${numericAmount} detected on Account ${account.accountNumber} by ${req.user.name}.`,
        details: { amount: numericAmount, accountId: account._id }
      });
    }

    await AuditLog.create({
      user: req.user._id,
      cardNumber: card.cardNumber,
      action: 'withdrawal',
      category: 'transaction',
      status: 'success',
      details: { amount: numericAmount, transactionId },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Cash dispensed successfully.',
      transaction: {
        transactionId,
        refNumber,
        amount: numericAmount,
        balanceAfter: account.balance,
        date: transaction.createdAt,
        denominations: notesDispensed
      }
    });
  } catch (error) {
    console.error('Error in withdraw:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 3. Cash Deposit
exports.deposit = async (req, res) => {
  try {
    const { denominations } = req.body; // Object: { "500": count, "100": count }
    
    let totalAmount = 0;
    const parsedDenoms = {};
    for (const [denom, count] of Object.entries(denominations)) {
      const numericCount = parseInt(count, 10);
      if (numericCount > 0) {
        totalAmount += parseInt(denom, 10) * numericCount;
        parsedDenoms[denom] = numericCount;
      }
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Account is frozen.' });
    }

    // Credit balance
    account.balance += totalAmount;
    account.ledgerBalance += totalAmount;
    await account.save();

    const { transactionId, refNumber } = generateTxIds();

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'deposit',
      amount: totalAmount,
      balanceAfter: account.balance,
      description: 'ATM Cash Deposit',
      status: 'success',
      details: {
        denominations: parsedDenoms
      }
    });

    await AuditLog.create({
      user: req.user._id,
      cardNumber: req.card.cardNumber,
      action: 'deposit',
      category: 'transaction',
      status: 'success',
      details: { amount: totalAmount, transactionId },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Cash deposited successfully.',
      transaction: {
        transactionId,
        refNumber,
        amount: totalAmount,
        balanceAfter: account.balance,
        date: transaction.createdAt,
        denominations: parsedDenoms
      }
    });
  } catch (error) {
    console.error('Error in deposit:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 4. Fund Transfer (with OTP verification flow)
exports.transfer = async (req, res) => {
  try {
    const { type, amount, beneficiaryName, target, otp } = req.body;
    const numericAmount = parseFloat(amount);

    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (account.status === 'frozen') {
      return res.status(403).json({ success: false, message: 'Account is frozen.' });
    }

    if (account.balance - numericAmount < account.minBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance to complete transfer.' });
    }

    // Step 1: Handle OTP Verification
    if (!otp) {
      // Generate OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await Otp.deleteMany({ cardNumber: req.card.cardNumber, purpose: 'transfer' });
      await Otp.create({
        cardNumber: req.card.cardNumber,
        code: otpCode,
        purpose: 'transfer'
      });

      console.log(`[ATM SIMULATION - TRANSFER OTP SENT]: ${otpCode}`);

      const responseData = {
        success: true,
        otpRequired: true,
        message: 'OTP sent to registered phone/email to authorize fund transfer.'
      };

      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        responseData.devOtp = otpCode;
      }

      return res.status(200).json(responseData);
    }

    // Step 2: Validate OTP
    const otpRecord = await Otp.findOne({ cardNumber: req.card.cardNumber, purpose: 'transfer' });
    if (!otpRecord || otpRecord.code !== otp) {
      if (otpRecord) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        if (otpRecord.attempts >= 3) {
          await Otp.deleteMany({ cardNumber: req.card.cardNumber, purpose: 'transfer' });
          return res.status(400).json({ success: false, message: 'Max OTP attempts reached. Transfer cancelled.' });
        }
        return res.status(400).json({ success: false, message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.` });
      }
      return res.status(400).json({ success: false, message: 'OTP expired or not requested.' });
    }

    // Clear OTP
    await Otp.deleteMany({ cardNumber: req.card.cardNumber, purpose: 'transfer' });

    // Step 3: Complete Transfer
    account.balance -= numericAmount;
    account.ledgerBalance -= numericAmount;
    await account.save();

    // If target is an internal account number, credit them
    let internalTargetAcc = null;
    if (type === 'account') {
      internalTargetAcc = await Account.findOne({ accountNumber: target });
      if (internalTargetAcc) {
        internalTargetAcc.balance += numericAmount;
        internalTargetAcc.ledgerBalance += numericAmount;
        await internalTargetAcc.save();
        
        // Record recipient transaction
        const { transactionId: recTxId, refNumber: recRef } = generateTxIds();
        await Transaction.create({
          user: internalTargetAcc.user,
          account: internalTargetAcc._id,
          transactionId: recTxId,
          refNumber: recRef,
          type: 'deposit',
          amount: numericAmount,
          balanceAfter: internalTargetAcc.balance,
          description: `Fund Transfer received from ${req.user.name}`,
          status: 'success'
        });
      }
    }

    const { transactionId, refNumber } = generateTxIds();

    const transaction = await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'transfer',
      amount: numericAmount,
      balanceAfter: account.balance,
      description: `Transfer to ${beneficiaryName} via ${type.toUpperCase()}`,
      status: 'success',
      details: {
        beneficiaryAccount: type === 'account' ? target : '',
        beneficiaryName,
        upiId: type === 'upi' ? target : '',
        notes: `Transfer target: ${target}`
      }
    });

    await AuditLog.create({
      user: req.user._id,
      cardNumber: req.card.cardNumber,
      action: 'transfer',
      category: 'transaction',
      status: 'success',
      details: { amount: numericAmount, target, beneficiaryName },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Transfer successful.',
      transaction: {
        transactionId,
        refNumber,
        amount: numericAmount,
        balanceAfter: account.balance,
        date: transaction.createdAt,
        beneficiaryName,
        target,
        type
      }
    });
  } catch (error) {
    console.error('Error in transfer:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 5. Change ATM PIN
exports.changePin = async (req, res) => {
  try {
    const { currentPin, newPin, otp } = req.body;
    const card = req.card;

    // Verify current PIN
    const isMatch = await card.comparePin(currentPin);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current PIN is incorrect.' });
    }

    // Step 1: OTP Requirement
    if (!otp) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await Otp.deleteMany({ cardNumber: card.cardNumber, purpose: 'pin_change' });
      await Otp.create({
        cardNumber: card.cardNumber,
        code: otpCode,
        purpose: 'pin_change'
      });

      console.log(`[ATM SIMULATION - PIN CHANGE OTP SENT]: ${otpCode}`);

      const responseData = {
        success: true,
        otpRequired: true,
        message: 'OTP sent to authorize PIN change.'
      };

      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        responseData.devOtp = otpCode;
      }

      return res.status(200).json(responseData);
    }

    // Step 2: Validate OTP
    const otpRecord = await Otp.findOne({ cardNumber: card.cardNumber, purpose: 'pin_change' });
    if (!otpRecord || otpRecord.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Clear OTP and update PIN
    await Otp.deleteMany({ cardNumber: card.cardNumber, purpose: 'pin_change' });

    card.pin = newPin; // pre-save hook will hash this
    await card.save();

    const { transactionId, refNumber } = generateTxIds();
    const account = await Account.findOne({ card: card._id });

    // Record pin change activity
    await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'pin_change',
      amount: 0,
      balanceAfter: account.balance,
      description: 'ATM PIN Changed',
      status: 'success'
    });

    await AuditLog.create({
      user: req.user._id,
      cardNumber: card.cardNumber,
      action: 'pin_change',
      category: 'security',
      status: 'success',
      details: { message: 'PIN updated successfully' },
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'ATM PIN changed successfully.' });
  } catch (error) {
    console.error('Error in changePin:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 6. Get Transaction History / Statement
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search, month, startDate, endDate } = req.query;

    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const query = { account: account._id };

    // Filters
    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { refNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (month) {
      const year = new Date().getFullYear();
      const monthIndex = parseInt(month, 10) - 1; // 1-indexed to 0-indexed
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0, 23, 59, 59);
      query.createdAt = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59))
      };
    }

    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getHistory:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 7. Request Cheque Book
exports.requestChequeBook = async (req, res) => {
  try {
    const account = await Account.findOne({ card: req.card._id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const requestId = 'CHQ' + Math.floor(100000 + Math.random() * 900000);
    
    account.chequeBookRequests.push({
      requestId,
      requestedAt: new Date(),
      status: 'requested'
    });
    await account.save();

    // Create Notification
    await Notification.create({
      type: 'cheque_requested',
      message: `Cheque book requested on Account ${account.accountNumber} by ${req.user.name}. Request ID: ${requestId}.`,
      details: { requestId, accountId: account._id }
    });

    // Record Transaction Activity
    const { transactionId, refNumber } = generateTxIds();
    await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'cheque_request',
      amount: 0,
      balanceAfter: account.balance,
      description: `Cheque Book Requested (ID: ${requestId})`,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Cheque book request submitted successfully.',
      requestId
    });
  } catch (error) {
    console.error('Error in requestChequeBook:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 8. Update KYC Details
exports.updateKyc = async (req, res) => {
  try {
    const { docType, docNumber } = req.body;
    
    // We'll simulate file upload by logging mock document path.
    const fileUrl = `/uploads/kyc_${req.user._id}_${Date.now()}.pdf`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.kycStatus = 'pending';
    user.kycDocuments.push({
      type: docType,
      fileUrl,
      status: 'pending',
      submittedAt: new Date()
    });
    await user.save();

    // Create Notification for admin approval
    await Notification.create({
      type: 'kyc_submitted',
      message: `${user.name} has uploaded a new ${docType} document for KYC verification.`,
      details: { userId: user._id, docType, docNumber }
    });

    const account = await Account.findOne({ card: req.card._id });
    const { transactionId, refNumber } = generateTxIds();

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'kyc_update',
      amount: 0,
      balanceAfter: account.balance,
      description: `KYC Document Uploaded (${docType})`,
      status: 'success'
    });

    await AuditLog.create({
      user: user._id,
      cardNumber: req.card.cardNumber,
      action: 'kyc_upload',
      category: 'security',
      status: 'success',
      details: { docType },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded successfully and are pending verification.',
      kycStatus: 'pending'
    });
  } catch (error) {
    console.error('Error in updateKyc:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 9. Card Lock / Unlock
exports.lockCard = async (req, res) => {
  try {
    const { action } = req.body; // 'lock' or 'unlock' or 'block'
    const card = req.card;

    if (action === 'block') {
      card.status = 'blocked';
      card.blockReason = 'Permanent block requested by customer';
    } else if (action === 'lock') {
      card.status = 'locked';
      card.blockReason = 'Temporary lock requested by customer';
    } else if (action === 'unlock') {
      card.status = 'active';
      card.blockReason = '';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid card action.' });
    }

    await card.save();

    const account = await Account.findOne({ card: card._id });
    const { transactionId, refNumber } = generateTxIds();

    await Transaction.create({
      user: req.user._id,
      account: account._id,
      transactionId,
      refNumber,
      type: 'card_lock',
      amount: 0,
      balanceAfter: account.balance,
      description: `Card Status Set to ${action.toUpperCase()}`,
      status: 'success'
    });

    await AuditLog.create({
      user: req.user._id,
      cardNumber: card.cardNumber,
      action: `card_${action}`,
      category: 'security',
      status: 'success',
      details: { status: card.status },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Card status updated to ${card.status} successfully.`,
      status: card.status
    });
  } catch (error) {
    console.error('Error in lockCard:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
