const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Card = require('../models/Card');
const Session = require('../models/Session');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smart_atm_secret_key_2026_prod');
    
    // Check if session is active
    const session = await Session.findOne({ token, isActive: true });
    if (!session) {
      return res.status(401).json({ success: false, message: 'Session expired or invalidated' });
    }

    // Check if session has timed out (2 minutes of inactivity)
    const twoMinutes = 2 * 60 * 1000;
    const now = new Date();
    if (now - session.lastActivity > twoMinutes) {
      session.isActive = false;
      await session.save();
      return res.status(401).json({ success: false, message: 'Session timed out due to inactivity', timeout: true });
    }

    // Update last activity
    session.lastActivity = now;
    await session.save();

    // Attach user
    req.user = await User.findById(decoded.id);
    if (!req.user || req.user.status !== 'active') {
      return res.status(401).json({ success: false, message: 'User account is inactive or suspended' });
    }

    // Attach card (if customer session)
    if (decoded.cardId) {
      req.card = await Card.findById(decoded.cardId);
      if (req.card && req.card.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Associated ATM card is locked or blocked' });
      }
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
