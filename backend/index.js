const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
console.log('Loaded from index.js:', process.env.EMAIL_USER, process.env.EMAIL_PASS);
const otpRoutes = require('./routes/otp');
const remindersRoutes = require('./routes/reminders');
const Reminder = require('./models/Reminder');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');
const feedbackRoutes = require('./routes/feedback');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://we-remind.vercel.app', 'http://localhost:3000'],
  credentials: true
}));

// Register routes
app.use('/api/otp', otpRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const reminders = await Reminder.find({ dateTime: { $lte: now }, sent: false });
  for (const reminder of reminders) {
    let anySent = false;
    // Email
    if (reminder.methods.includes('email') && reminder.email && !reminder.sentStatus.email) {
      await transporter.sendMail({
        to: reminder.email,
        subject: 'Your Reminder',
        text: reminder.title
      });
      reminder.sentStatus.email = true;
      anySent = true;
    }
    // Phone (call)
    if (reminder.methods.includes('phone') && reminder.phone && !reminder.sentStatus.phone) {
      await twilioClient.calls.create({
        twiml: `<Response><Say voice="alice">This is your reminder: ${reminder.title}</Say></Response>`,
        to: reminder.phone,
        from: twilioPhone
      });
      reminder.sentStatus.phone = true;
      anySent = true;
    }
    // WhatsApp (optional, can send message)
    if (reminder.methods.includes('whatsapp') && reminder.whatsapp && !reminder.sentStatus.whatsapp) {
      await twilioClient.messages.create({
        body: `Your reminder: ${reminder.title}`,
        from: `whatsapp:${twilioPhone}`,
        to: reminder.whatsapp
      });
      reminder.sentStatus.whatsapp = true;
      anySent = true;
    }
    // Set sent to true only if all selected methods are sent
    reminder.sent = reminder.methods.every(m => reminder.sentStatus[m]);
    if (anySent) {
      reminder.updatedAt = new Date();
      await reminder.save();
      console.log('Updated reminder:', reminder._id, reminder.sentStatus);
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 