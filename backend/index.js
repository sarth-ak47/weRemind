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

// Debug endpoint to check environment and reminder data
app.get('/api/debug', async (req, res) => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({ dateTime: { $lte: now }, sent: false });
    const allReminders = await Reminder.find({}).limit(5);
    
    res.json({
      environment: {
        emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
        emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
        twilioSid: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
        twilioToken: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
        twilioPhone: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set',
        mongoUri: process.env.MONGO_URI ? 'Set' : 'Not set'
      },
      reminders: {
        dueCount: dueReminders.length,
        totalCount: await Reminder.countDocuments(),
        sampleReminders: allReminders.map(r => ({
          id: r._id,
          title: r.title,
          dateTime: r.dateTime,
          methods: r.methods,
          email: r.email,
          phone: r.phone,
          whatsapp: r.whatsapp,
          sent: r.sent,
          sentStatus: r.sentStatus
        }))
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to manually trigger reminder processing
app.get('/api/test-reminders', async (req, res) => {
  try {
    console.log('Manual reminder processing triggered');
    const now = new Date();
    const reminders = await Reminder.find({ dateTime: { $lte: now }, sent: false }).limit(10);
    console.log('Found', reminders.length, 'due reminders for manual processing');
    
    let processedCount = 0;
    for (const reminder of reminders) {
      console.log('Processing reminder:', reminder._id, 'Title:', reminder.title, 'Methods:', reminder.methods);
      let anySent = false;
      
      // Email
      if (reminder.methods.includes('email') && reminder.email && !reminder.sentStatus.email) {
        try {
          console.log('Sending email to:', reminder.email);
          await transporter.sendMail({
            to: reminder.email,
            subject: 'Your Reminder',
            text: reminder.title
          });
          reminder.sentStatus.email = true;
          anySent = true;
          console.log('Email sent successfully to:', reminder.email);
        } catch (error) {
          console.error('Email sending failed:', error.message);
        }
      }
      
      // Phone (call)
      if (reminder.methods.includes('phone') && reminder.phone && !reminder.sentStatus.phone) {
        try {
          console.log('Making phone call to:', reminder.phone);
          await twilioClient.calls.create({
            twiml: `<Response><Say voice="alice">This is your reminder: ${reminder.title}</Say></Response>`,
            to: reminder.phone,
            from: twilioPhone
          });
          reminder.sentStatus.phone = true;
          anySent = true;
          console.log('Phone call initiated to:', reminder.phone);
        } catch (error) {
          console.error('Phone call failed:', error.message);
        }
      }
      
      // WhatsApp
      if (reminder.methods.includes('whatsapp') && reminder.whatsapp && !reminder.sentStatus.whatsapp) {
        try {
          console.log('Sending WhatsApp message to:', reminder.whatsapp);
          await twilioClient.messages.create({
            body: `Your reminder: ${reminder.title}`,
            from: `whatsapp:${twilioPhone}`,
            to: `whatsapp:${reminder.whatsapp}`
          });
          reminder.sentStatus.whatsapp = true;
          anySent = true;
          console.log('WhatsApp message sent to:', reminder.whatsapp);
        } catch (error) {
          console.error('WhatsApp sending failed:', error.message);
        }
      }
      
      // Set sent to true only if all selected methods are sent
      reminder.sent = reminder.methods.every(m => reminder.sentStatus[m]);
      if (anySent) {
        reminder.updatedAt = new Date();
        await reminder.save();
        processedCount++;
        console.log('Updated reminder:', reminder._id, 'Sent status:', reminder.sentStatus, 'Fully sent:', reminder.sent);
      }
    }
    
    res.json({ 
      message: 'Manual processing completed', 
      processedCount, 
      totalReminders: reminders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Manual processing error:', error);
    res.status(500).json({ error: error.message });
  }
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

// Reset failed reminders (mark as unsent for retry)
app.post('/api/reset-failed-reminders', async (req, res) => {
  try {
    console.log('Resetting failed reminders');
    const result = await Reminder.updateMany(
      { 
        sent: true, 
        $or: [
          { 'sentStatus.email': false },
          { 'sentStatus.phone': false },
          { 'sentStatus.whatsapp': false }
        ]
      },
      { 
        $set: { 
          sent: false,
          'sentStatus.email': false,
          'sentStatus.phone': false,
          'sentStatus.whatsapp': false
        } 
      }
    );
    
    res.json({ 
      message: 'Failed reminders reset successfully',
      modifiedCount: result.modifiedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset failed reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

cron.schedule('* * * * *', async () => {
  try {
    console.log('Cron job running at:', new Date().toISOString());
    const now = new Date();
    const reminders = await Reminder.find({ dateTime: { $lte: now }, sent: false });
    console.log('Found', reminders.length, 'due reminders');
    
    for (const reminder of reminders) {
      console.log('Processing reminder:', reminder._id, 'Title:', reminder.title, 'Methods:', reminder.methods);
      let anySent = false;
      
      // Email
      if (reminder.methods.includes('email') && reminder.email && !reminder.sentStatus.email) {
        try {
          console.log('Sending email to:', reminder.email);
          await transporter.sendMail({
            to: reminder.email,
            subject: 'Your Reminder',
            text: reminder.title
          });
          reminder.sentStatus.email = true;
          anySent = true;
          console.log('Email sent successfully to:', reminder.email);
        } catch (error) {
          console.error('Email sending failed:', error.message);
        }
      }
      
      // Phone (call)
      if (reminder.methods.includes('phone') && reminder.phone && !reminder.sentStatus.phone) {
        try {
          console.log('Making phone call to:', reminder.phone);
          await twilioClient.calls.create({
            twiml: `<Response><Say voice="alice">This is your reminder: ${reminder.title}</Say></Response>`,
            to: reminder.phone,
            from: twilioPhone
          });
          reminder.sentStatus.phone = true;
          anySent = true;
          console.log('Phone call initiated to:', reminder.phone);
        } catch (error) {
          console.error('Phone call failed:', error.message);
        }
      }
      
      // WhatsApp
      if (reminder.methods.includes('whatsapp') && reminder.whatsapp && !reminder.sentStatus.whatsapp) {
        try {
          console.log('Sending WhatsApp message to:', reminder.whatsapp);
          await twilioClient.messages.create({
            body: `Your reminder: ${reminder.title}`,
            from: `whatsapp:${twilioPhone}`,
            to: `whatsapp:${reminder.whatsapp}`
          });
          reminder.sentStatus.whatsapp = true;
          anySent = true;
          console.log('WhatsApp message sent to:', reminder.whatsapp);
        } catch (error) {
          console.error('WhatsApp sending failed:', error.message);
        }
      }
      
      // Set sent to true only if all selected methods are sent
      reminder.sent = reminder.methods.every(m => reminder.sentStatus[m]);
      if (anySent) {
        reminder.updatedAt = new Date();
        await reminder.save();
        console.log('Updated reminder:', reminder._id, 'Sent status:', reminder.sentStatus, 'Fully sent:', reminder.sent);
      } else {
        // If no notifications were sent, don't mark as sent
        console.log('No notifications sent for reminder:', reminder._id, 'Methods:', reminder.methods);
      }
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 