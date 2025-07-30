const express = require('express');
const router = express.Router();
const UserChannel = require('../models/UserChannel');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Reminder = require('../models/Reminder');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Not loaded');

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { userId, channelType, contact } = req.body;

    if (!userId || !channelType || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if channel is already verified
    const existingChannel = await UserChannel.findOne({ userId, channelType });
    if (existingChannel && existingChannel.isVerified) {
      return res.status(400).json({ error: 'Channel already verified' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    await OTP.create({
      userId,
      channelType,
      contact,
      otp,
      expiresAt
    });

    // Send OTP based on channel type
    if (channelType === 'email') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contact,
        subject: 'WeRemind - OTP Verification',
        html: `
          <h2>Your OTP for WeRemind</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Detailed email error:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }
    } else if (channelType === 'phone') {
      // Send OTP via SMS using Twilio
      try {
        await twilioClient.messages.create({
          body: `Your WeRemind OTP is: ${otp}`,
          from: twilioPhone,
          to: contact.startsWith('+') ? contact : `+91${contact}` // Default to India country code if not provided
        });
        console.log('SMS sent successfully');
      } catch (smsError) {
        console.error('Detailed SMS error:', smsError);
        if (smsError.code === 21211 || smsError.message.includes('unverified')) {
          throw new Error(`Failed to send SMS: The number ${contact} is unverified. Please verify your number at: https://twilio.com/user/account/phone-numbers/verified`);
        } else {
          throw new Error(`Failed to send SMS: ${smsError.message}`);
        }
      }
    } else if (channelType === 'whatsapp') {
      // Send OTP via WhatsApp using Twilio
      try {
        await twilioClient.messages.create({
          body: `Your WeRemind OTP is: ${otp}`,
          from: `whatsapp:${twilioPhone}`,
          to: contact.startsWith('whatsapp:') ? contact : `whatsapp:+91${contact}` // Default to India country code if not provided
        });
        console.log('WhatsApp message sent successfully');
      } catch (waError) {
        console.error('Detailed WhatsApp error:', waError);
        throw new Error(`Failed to send WhatsApp message: ${waError.message}`);
      }
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, channelType, contact, otp } = req.body;

    if (!userId || !channelType || !contact || !otp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the OTP
    const otpRecord = await OTP.findOne({
      userId,
      channelType,
      contact,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Save or update the verified channel
    await UserChannel.findOneAndUpdate(
      { userId, channelType },
      {
        contact,
        isVerified: true,
        verifiedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Delete the used OTP
    await OTP.findByIdAndDelete(otpRecord._id);

    res.json({ message: 'Channel verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Add new reminder endpoint
router.post('/reminders', async (req, res) => {
  try {
    const { title, dateTime, methods, email, phone, whatsapp } = req.body;
    if (!title || !dateTime || !methods || methods.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const reminder = await Reminder.create({
      title,
      dateTime,
      methods,
      email,
      phone,
      whatsapp
    });
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Get user channels
router.get('/user-channels/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const channels = await UserChannel.find({ userId });
    res.json(channels);
  } catch (error) {
    console.error('Error fetching user channels:', error);
    res.status(500).json({ error: 'Failed to fetch user channels' });
  }
});

// Disconnect channel
router.delete('/disconnect-channel/:userId/:channelType', async (req, res) => {
  try {
    const { userId, channelType } = req.params;
    
    await UserChannel.findOneAndDelete({ userId, channelType });
    
    res.json({ message: 'Channel disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting channel:', error);
    res.status(500).json({ error: 'Failed to disconnect channel' });
  }
});

module.exports = router; 