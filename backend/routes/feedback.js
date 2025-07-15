const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Use the same transporter as in index.js
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  console.log('Received feedback:', req.body); // Debug log
  const { feedback, user } = req.body;
  if (!feedback) {
    return res.status(400).json({ error: 'Feedback is required' });
  }
  try {
    await transporter.sendMail({
      to: 'sarthakvarsh9696@gmail.com',
      from: process.env.EMAIL_USER, // authenticated sender
      replyTo: user || process.env.EMAIL_USER, // user's email if provided
      subject: 'New Feedback from weRemind',
      text: `Feedback: ${feedback}\nUser: ${user || 'Anonymous'}`
    });
    res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send feedback' });
  }
});

module.exports = router; 