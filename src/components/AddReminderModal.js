import React, { useState, useEffect } from 'react';
import './AddReminderModal.css';

export default function AddReminderModal({ open, onClose, onAdd, userChannels, initial }) {
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [selectedMethods, setSelectedMethods] = useState([]);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title || '');
      // Convert initial dateTime to datetime-local format if needed
      let formattedDateTime = '';
      if (initial?.dateTime) {
        const dt = new Date(initial.dateTime);
        if (!isNaN(dt.getTime())) {
          // Format to yyyy-MM-ddTHH:mm for datetime-local input
          // This converts UTC to local time correctly
          const year = dt.getFullYear();
          const month = String(dt.getMonth() + 1).padStart(2, '0');
          const day = String(dt.getDate()).padStart(2, '0');
          const hours = String(dt.getHours()).padStart(2, '0');
          const minutes = String(dt.getMinutes()).padStart(2, '0');
          formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
          formattedDateTime = '';
        }
      }
      setDateTime(formattedDateTime);
      setSelectedMethods(initial?.methods || []);
    }
  }, [open, initial]);

  if (!open) return null;

  const verifiedChannels = userChannels.filter(ch => ch.isVerified);

  const handleMethodToggle = (type) => {
    setSelectedMethods((prev) =>
      prev.includes(type) ? prev.filter(m => m !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !dateTime || selectedMethods.length === 0) return;
    
    // datetime-local gives us local time in the format "YYYY-MM-DDTHH:mm"
    // Parse the components
    const [datePart, timePart] = dateTime.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Create a Date object using the local time components
    // This creates a date in the user's local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    // The localDate.toISOString() already gives us the correct UTC time
    onAdd({ title, dateTime: localDate.toISOString(), methods: selectedMethods });
  };

  return (
    <div className="add-reminder-modal-overlay">
      <div className="add-reminder-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{initial ? 'Edit Reminder' : 'Add New Reminder'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            type="text"
            placeholder="Remind me to close the fridge.."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <label>Date and Time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            required
          />
          <label>Notification Methods</label>
          <div className="methods-list">
            {verifiedChannels.length === 0 ? (
              <div className="no-methods">No verified channels</div>
            ) : (
              verifiedChannels.map(ch => (
                <button
                  type="button"
                  key={ch.channelType}
                  className={`method-btn${selectedMethods.includes(ch.channelType) ? ' selected' : ''}`}
                  onClick={() => handleMethodToggle(ch.channelType)}
                >
                  {ch.channelType === 'email' && <span>📧 Email</span>}
                  {ch.channelType === 'phone' && <span>📱 Phone (Call)</span>}
                  {ch.channelType === 'whatsapp' && <span>💬 WhatsApp</span>}
                </button>
              ))
            )}
          </div>
          {verifiedChannels.some(ch => ch.channelType === 'phone') && (
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
              💡 Phone notifications work best with verified numbers. Email is recommended for new users.
            </div>
          )}
          <button
            type="submit"
            className="add-btn"
            disabled={!title || !dateTime || selectedMethods.length === 0}
          >
            {initial ? 'Save Changes' : 'Add Reminder'}
          </button>
          <button type="button" className="close-btn-secondary" onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
} 