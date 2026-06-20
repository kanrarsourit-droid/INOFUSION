const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      // Password is only required if user is not logging in via Google/GitHub OAuth
      return !this.googleId && !this.githubId;
    },
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: [
      'patient', 
      'super_admin', 
      'hospital_admin', 
      'doctor', 
      'nurse', 
      'receptionist', 
      'pharmacist',
      'admin' // Keep admin for fallback compatibility
    ],
    default: 'patient'
  },
  phone: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    default: null,
    sparse: true
  },
  githubId: {
    type: String,
    default: null,
    sparse: true
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpire: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt if modified
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

