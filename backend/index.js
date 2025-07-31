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

// Debug environment variables
console.log('Email configuration:');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Debug Twilio configuration
console.log('Twilio configuration:');
console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'NOT SET');
console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'NOT SET');
console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER : 'NOT SET');

cron.schedule('* * * * *', async () => {
  const now = new Date();
  console.log('Cron job running at:', now.toISOString());
  
  const reminders = await Reminder.find({ dateTime: { $lte: now }, sent: false });
  console.log('Found', reminders.length, 'due reminders');
  
  for (const reminder of reminders) {
    console.log('Processing reminder:', reminder._id, 'Title:', reminder.title);
    console.log('Reminder methods:', reminder.methods);
    console.log('Reminder contacts - Email:', reminder.email, 'Phone:', reminder.phone, 'WhatsApp:', reminder.whatsapp);
    
    let anySent = false;
    // Email
    if (reminder.methods.includes('email') && reminder.email && !reminder.sentStatus.email) {
      console.log('Attempting to send email to:', reminder.email);
      try {
        await transporter.sendMail({
          to: reminder.email,
          subject: 'Your Reminder',
          text: reminder.title
        });
        reminder.sentStatus.email = true;
        anySent = true;
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Email sending failed:', error.message);
      }
    }
    // Phone (call)
    if (reminder.methods.includes('phone') && reminder.phone && !reminder.sentStatus.phone) {
      console.log('Attempting to make phone call to:', reminder.phone);
      try {
        await twilioClient.calls.create({
          twiml: `<Response><Say voice="alice">This is your reminder: ${reminder.title}</Say></Response>`,
          to: reminder.phone,
          from: twilioPhone
        });
        reminder.sentStatus.phone = true;
        anySent = true;
        console.log('Phone call initiated successfully');
      } catch (error) {
        console.error('Phone call failed:', error.message);
      }
    }
    // WhatsApp (optional, can send message)
    if (reminder.methods.includes('whatsapp') && reminder.whatsapp && !reminder.sentStatus.whatsapp) {
      console.log('Attempting to send WhatsApp message to:', reminder.whatsapp);
      try {
        await twilioClient.messages.create({
          body: `Your reminder: ${reminder.title}`,
          from: `whatsapp:${twilioPhone}`,
          to: reminder.whatsapp
        });
        reminder.sentStatus.whatsapp = true;
        anySent = true;
        console.log('WhatsApp message sent successfully');
      } catch (error) {
        console.error('WhatsApp sending failed:', error.message);
      }
    }
    // Set sent to true only if all selected methods are sent
    reminder.sent = reminder.methods.every(m => reminder.sentStatus[m]);
    if (anySent) {
      reminder.updatedAt = new Date();
      await reminder.save();
      console.log('Updated reminder:', reminder._id, 'Sent status:', reminder.sentStatus);
    } else {
      console.log('No methods were sent for reminder:', reminder._id);
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 