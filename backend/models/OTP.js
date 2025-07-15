const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  channelType: {
    type: String,
    required: true,
    enum: ['email', 'phone', 'whatsapp']
  },
  contact: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired OTPs
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OTP', otpSchema); 