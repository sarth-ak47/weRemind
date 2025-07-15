import React from 'react';
import './ReminderList.css';

function formatDateTime(dt) {
  const date = new Date(dt);
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

export default function ReminderList({ reminders, onEdit, onDetails, onDelete }) {
  if (!reminders || reminders.length === 0) return null;
  return (
    <div className="reminder-list-root">
      <div className="reminder-list-title">UPCOMING</div>
      {reminders.map(rem => (
        <div className="reminder-card" key={rem.id || rem.title + rem.dateTime}>
          <div className="reminder-card-main">
            <span className="reminder-dot" />
            <div className="reminder-info">
              <div className="reminder-title">{rem.title}</div>
              <div className="reminder-time">{formatDateTime(rem.dateTime)}</div>
            </div>
            <div className="reminder-icons">
              {rem.methods?.includes('email') && <span className="reminder-icon" title="Email">📧</span>}
              {rem.methods?.includes('phone') && <span className="reminder-icon" title="Phone">📱</span>}
              {rem.methods?.includes('whatsapp') && <span className="reminder-icon" title="WhatsApp">💬</span>}
              <span className="reminder-icon" title="Edit" onClick={() => onEdit && onEdit(rem)}>✏️</span>
              <button
                className="reminder-close-btn"
                title="Delete"
                onClick={() => onDelete && onDelete(rem)}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.3em', cursor: 'pointer', marginLeft: 6, padding: 0 }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 