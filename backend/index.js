const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

console.log('=== BACKEND STARTUP DEBUG ===');
console.log('Environment variables loaded:');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'NOT SET');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');
console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'NOT SET');
console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'NOT SET');
console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER : 'NOT SET');

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Register routes
app.use('/api/otp', otpRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB Atlas
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
  });

// Email transporter setup with error handling
console.log('Setting up email transporter...');
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('✅ Email transporter configured');
} catch (error) {
  console.error('❌ Email transporter setup failed:', error.message);
}

// Twilio setup with error handling
console.log('Setting up Twilio client...');
let twilioClient, twilioPhone;
try {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  console.log('✅ Twilio client configured');
} catch (error) {
  console.error('❌ Twilio setup failed:', error.message);
}

// Debug environment variables
console.log('Email configuration:');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');

// Debug Twilio configuration
console.log('Twilio configuration:');
console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'NOT SET');
console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'NOT SET');
console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER : 'NOT SET');

cron.schedule('* * * * *', async () => {
  try {
    console.log('Cron job running at:', new Date().toISOString());
    
    if (!transporter || !twilioClient) {
      console.log('⚠️ Skipping cron job - email or Twilio not configured');
      return;
    }
    
    const now = new Date();
    
    // Clean up very old reminders (older than 1 hour) that haven't been marked as sent
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oldReminders = await Reminder.find({ 
      dateTime: { $lte: oneHourAgo }, 
      sent: false 
    });
    
    if (oldReminders.length > 0) {
      console.log(`Cleaning up ${oldReminders.length} old reminders`);
      for (const oldReminder of oldReminders) {
        oldReminder.sent = true;
        oldReminder.updatedAt = new Date();
        await oldReminder.save();
        console.log(`Marked old reminder as sent: ${oldReminder._id} - ${oldReminder.title}`);
      }
    }
    
    const reminders = await Reminder.find({ dateTime: { $lte: now }, sent: false });
    console.log('Found', reminders.length, 'due reminders');
    
    for (const reminder of reminders) {
      try {
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
        // Set sent to true if any method was sent successfully
        // Also mark individual methods as failed if they couldn't be sent
        let methodsAttempted = 0;
        let methodsSucceeded = 0;
        
        // Check each selected method
        for (const method of reminder.methods) {
          if (method === 'email' && reminder.email) {
            methodsAttempted++;
            if (reminder.sentStatus.email) {
              methodsSucceeded++;
            } else {
              // Mark as failed if we have email but it wasn't sent
              reminder.sentStatus.email = false;
            }
          }
          if (method === 'phone' && reminder.phone) {
            methodsAttempted++;
            if (reminder.sentStatus.phone) {
              methodsSucceeded++;
            } else {
              // Mark as failed if we have phone but it wasn't sent
              reminder.sentStatus.phone = false;
            }
          }
          if (method === 'whatsapp' && reminder.whatsapp) {
            methodsAttempted++;
            if (reminder.sentStatus.whatsapp) {
              methodsSucceeded++;
            } else {
              // Mark as failed if we have whatsapp but it wasn't sent
              reminder.sentStatus.whatsapp = false;
            }
          }
        }
        
        // Mark reminder as sent if we attempted to send it (even if some methods failed)
        if (methodsAttempted > 0) {
          reminder.sent = true;
          console.log(`Reminder processed: ${methodsSucceeded}/${methodsAttempted} methods succeeded`);
        }
        
        if (anySent || methodsAttempted > 0) {
          reminder.updatedAt = new Date();
          await reminder.save();
          console.log('Updated reminder:', reminder._id, 'Sent status:', reminder.sentStatus, 'Overall sent:', reminder.sent);
        } else {
          console.log('No methods were attempted for reminder:', reminder._id);
        }
      } catch (reminderError) {
        console.error('Error processing reminder:', reminder._id, reminderError.message);
      }
    }
  } catch (cronError) {
    console.error('Cron job error:', cronError.message);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('=== BACKEND STARTUP COMPLETE ===');
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🌐 Server URL: https://weremind.onrender.com`);
  console.log('=== READY TO HANDLE REQUESTS ===');
}).on('error', (error) => {
  console.error('❌ Server startup failed:', error.message);
  process.exit(1);
}); 