const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// Create a new reminder
router.post('/', async (req, res) => {
  try {
    const { userId, title, dateTime, methods, email, phone, whatsapp } = req.body;
    
    if (!userId || !title || !dateTime || !methods || methods.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const reminder = new Reminder({
      userId,
      title,
      dateTime,
      methods,
      email,
      phone,
      whatsapp
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get reminders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const reminders = await Reminder.find({ userId }).sort({ dateTime: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific reminder (with user verification)
router.delete('/:reminderId', async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const reminder = await Reminder.findOneAndDelete({ _id: reminderId, userId });
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found or access denied' });
    }
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 