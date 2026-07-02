const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Card = require('../models/Card');
const User = require('../models/User');
const Account = require('../models/Account');
const Otp = require('../models/Otp');
const Session = require('../models/Session');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// Generate JWT token helper
const generateToken = (userId, cardId = null) => {
  return jwt.sign(
    { id: userId, cardId },
    process.env.JWT_SECRET || 'smart_atm_secret_key_2026_prod',
    { expiresIn: '1h' }
  );
};

// 1. Check Card Number & Expiry
exports.checkCard = async (req, res) => {
  try {
    const { cardNumber, expiryDate } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const card = await Card.findOne({ cardNumber }).populate('user');
    if (!card) {
      await AuditLog.create({
        action: 'card_validation',
        category: 'auth',
        status: 'failure',
        details: { cardNumber, reason: 'Card number not found' },
        ipAddress
      });
      return res.status(404).json({ success: false, message: 'Invalid Card Number or Card not found.' });
    }

    if (card.expiryDate !== expiryDate) {
      await AuditLog.create({
        action: 'card_validation',
        category: 'auth',
        status: 'failure',
        details: { cardNumber, reason: 'Invalid Expiry Date' },
        ipAddress
      });
      return res.status(400).json({ success: false, message: 'Invalid Expiry Date.' });
    }

    if (card.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'This Card is blocked. Please contact the Bank Admin.' });
    }

    if (card.status === 'locked') {
      return res.status(403).json({ success: false, message: 'This Card is temporarily locked. You can unlock it in services.' });
    }

    await AuditLog.create({
      user: card.user._id,
      cardNumber: card.cardNumber,
      action: 'card_validation',
      category: 'auth',
      status: 'success',
      details: { message: 'Card number and expiry validated' },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Card validated successfully.',
      data: {
        cardNumber: card.cardNumber,
        cardHolderName: card.user.name
      }
    });
  } catch (error) {
    console.error('Error in checkCard:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 2. Verify PIN & Generate OTP
exports.verifyPin = async (req, res) => {
  try {
    const { cardNumber, pin } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const card = await Card.findOne({ cardNumber }).populate('user');
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    if (card.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Card is blocked.' });
    }

    const isMatch = await card.comparePin(pin);
    if (!isMatch) {
      card.failedAttempts += 1;
      
      let message = `Incorrect PIN. ${3 - card.failedAttempts} attempts remaining.`;
      let shouldBlock = card.failedAttempts >= 3;

      if (shouldBlock) {
        card.status = 'blocked';
        card.blockReason = '3 incorrect PIN attempts';
        message = 'Card has been blocked due to 3 incorrect PIN attempts. Admin has been notified.';

        // Create Admin Notification
        await Notification.create({
          type: 'card_blocked',
          message: `ATM Card ${card.cardNumber.substring(0, 4)}...${card.cardNumber.substring(12)} belonging to ${card.user.name} has been BLOCKED due to excessive failed PIN attempts.`,
          details: { cardId: card._id, userId: card.user._id, cardNumber: card.cardNumber }
        });
      }

      await card.save();

      await AuditLog.create({
        user: card.user._id,
        cardNumber: card.cardNumber,
        action: 'pin_verification',
        category: 'security',
        status: 'failure',
        details: { attempts: card.failedAttempts, isBlocked: shouldBlock },
        ipAddress
      });

      return res.status(400).json({ success: false, message, failedAttempts: card.failedAttempts });
    }

    // Reset failed attempts upon successful login
    card.failedAttempts = 0;
    await card.save();

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds expiry

    // Delete any existing OTP for this card
    await Otp.deleteMany({ cardNumber });

    // Save OTP to DB
    await Otp.create({
      cardNumber,
      code: otpCode,
      purpose: 'login',
      attempts: 0
    });

    console.log(`[ATM SIMULATION - OTP SENT TO ${card.user.email} & ${card.user.phone}]: ${otpCode}`);

    await AuditLog.create({
      user: card.user._id,
      cardNumber: card.cardNumber,
      action: 'otp_generated',
      category: 'security',
      status: 'success',
      details: { purpose: 'login' },
      ipAddress
    });

    // Provide OTP in response for development convenience
    const responseData = {
      success: true,
      message: `OTP sent to registered mobile/email (Valid for 60s).`
    };

    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      responseData.devOtp = otpCode; // Send OTP in Dev mode only for testing convenience
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in verifyPin:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 3. Verify OTP & Authenticate
exports.verifyOtp = async (req, res) => {
  try {
    const { cardNumber, otp } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const card = await Card.findOne({ cardNumber }).populate('user');
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    const otpRecord = await Otp.findOne({ cardNumber, purpose: 'login' });
    if (!otpRecord) {
      await AuditLog.create({
        user: card.user._id,
        cardNumber: card.cardNumber,
        action: 'otp_verification',
        category: 'security',
        status: 'failure',
        details: { reason: 'OTP expired or not requested' },
        ipAddress
      });
      return res.status(400).json({ success: false, message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      let shouldLogout = otpRecord.attempts >= 3;
      let message = `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`;

      await AuditLog.create({
        user: card.user._id,
        cardNumber: card.cardNumber,
        action: 'otp_verification',
        category: 'security',
        status: 'failure',
        details: { attempts: otpRecord.attempts, reachedMax: shouldLogout },
        ipAddress
      });

      if (shouldLogout) {
        await Otp.deleteMany({ cardNumber });
        return res.status(400).json({ success: false, message: 'Maximum OTP attempts reached. Session terminated.', logout: true });
      }

      return res.status(400).json({ success: false, message });
    }

    // OTP verified successfully. Delete OTP.
    await Otp.deleteMany({ cardNumber });

    // Retrieve full user profile & associated account
    const user = card.user;
    const account = await Account.findOne({ card: card._id });

    // Generate JWT
    const token = generateToken(user._id, card._id);

    // Create session
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour session
    await Session.create({
      user: user._id,
      token,
      ipAddress,
      userAgent,
      isActive: true,
      lastActivity: new Date()
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    await AuditLog.create({
      user: user._id,
      cardNumber: card.cardNumber,
      action: 'login',
      category: 'auth',
      status: 'success',
      details: { accountId: account ? account._id : null },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photoUrl: user.photoUrl,
        role: user.role,
        kycStatus: user.kycStatus,
        lastLogin: user.lastLogin
      },
      account: account ? {
        id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        branch: account.branch
      } : null
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 4. Admin Direct Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Direct password verification (select the password explicitly since it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
      await AuditLog.create({
        action: 'admin_login',
        category: 'auth',
        status: 'failure',
        details: { email, reason: 'Invalid credentials or not authorized' },
        ipAddress
      });
      return res.status(401).json({ success: false, message: 'Invalid Credentials or Access Denied.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditLog.create({
        user: user._id,
        action: 'admin_login',
        category: 'auth',
        status: 'failure',
        details: { email, reason: 'Incorrect password' },
        ipAddress
      });
      return res.status(401).json({ success: false, message: 'Invalid Credentials.' });
    }

    // Generate JWT (no card attached for admin)
    const token = generateToken(user._id);

    // Create session
    await Session.create({
      user: user._id,
      token,
      ipAddress,
      userAgent,
      isActive: true,
      lastActivity: new Date()
    });

    user.lastLogin = new Date();
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'admin_login',
      category: 'auth',
      status: 'success',
      details: { role: user.role },
      ipAddress
    });

    res.status(200).json({
      success: true,
      message: 'Admin Authentication successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 5. Logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (token) {
      const session = await Session.findOne({ token });
      if (session) {
        session.isActive = false;
        await session.save();
      }
    }
    
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      cardNumber: req.card ? req.card.cardNumber : '',
      action: 'logout',
      category: 'auth',
      status: 'success',
      details: { message: 'Logged out successfully' },
      ipAddress: req.ip || req.connection.remoteAddress
    });

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
