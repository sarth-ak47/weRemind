const mongoose = require('mongoose');

const userChannelSchema = new mongoose.Schema({
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique user-channel combinations
userChannelSchema.index({ userId: 1, channelType: 1 }, { unique: true });

module.exports = mongoose.model('UserChannel', userChannelSchema); 