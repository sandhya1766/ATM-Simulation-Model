const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const KycDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PAN', 'Aadhar', 'Passport', 'Driving License'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  photoUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super-admin'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'blocked'],
    default: 'active'
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [KycDocumentSchema],
  password: {
    type: String,
    select: false // Avoid sending passwords by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Verify Admin password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
