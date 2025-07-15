const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dateTime: { type: Date, required: true },
  methods: [{ type: String, enum: ['email', 'phone', 'whatsapp'] }],
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  sent: { type: Boolean, default: false },
  sentStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema); 