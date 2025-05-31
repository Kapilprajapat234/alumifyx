const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    match: [/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits']
  },
  education: String,
  skills: { 
    type: String, 
    trim: true 
  },
  certifications: String,
  address: String,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  dob: String,
  bio: String,
  profilePic: String,
  mentorships: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mentorship' 
  }],
  resetToken: String,
  resetTokenExpiry: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    if (isNaN(saltRounds) || saltRounds < 10) {
      throw new Error('Invalid BCRYPT_SALT_ROUNDS in .env');
    }
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetToken;
  delete userObject.resetTokenExpiry;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 