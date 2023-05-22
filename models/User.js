const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geocoder = require('../utils/geocoder');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/,
      'Please enter a valid email.'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  address: {
    type: String,
    required: [true, 'Please add a city, state (if applicable), and country.']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  console.log(loc, 'location!!');
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipCode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB.
  this.address = undefined;
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database.
UserSchema.methods.matchPassword = async function (passwordInput) {
  return await bcrypt.compare(passwordInput, this.password);
};

// Generate and hash password token;
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
