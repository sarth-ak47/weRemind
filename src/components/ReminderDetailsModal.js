import React from 'react';
import './ReminderDetailsModal.css';

function formatDate(dt) {
  const date = new Date(dt);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(dt) {
  const date = new Date(dt);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDateTime(dt) {
  const date = new Date(dt);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ReminderDetailsModal({ open, reminder, onClose }) {
  if (!open || !reminder) return null;
  const isPast = new Date(reminder.dateTime) < new Date();
  return (
    <div className="reminder-details-modal-overlay">
      <div className="reminder-details-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="reminder-details-header">
          <span className="reminder-details-title">{reminder.title}</span>
          {isPast && <span className="reminder-details-past">Past</span>}
        </div>
        <div className="reminder-details-progress">
          <span>Progress</span>
          <div className="reminder-details-progress-bar"><div className="reminder-details-progress-inner" style={{width: '100%'}} /></div>
          <span className="reminder-details-progress-label">100%</span>
        </div>
        <div className="reminder-details-row-group">
          <div className="reminder-details-row"><span>📅 Date</span><span>{formatDate(reminder.dateTime)}</span></div>
          <div className="reminder-details-row"><span>⏰ Time</span><span>{formatTime(reminder.dateTime)}</span></div>
          <div className="reminder-details-row"><span>🔔 Reminder</span><span>0 days from now</span></div>
        </div>
        <div className="reminder-details-section-title">Notification Channels</div>
        <div className="reminder-details-channels">
          {reminder.methods?.includes('email') && (
            <div className="reminder-details-channel">
              <span>📧 Email</span>
              <span className={`reminder-details-status ${reminder.sentStatus?.email ? 'sent' : 'pending'}`}>
                {reminder.sentStatus?.email ? '✔ Sent' : '⏳ Pending'}
              </span>
            </div>
          )}
          {reminder.methods?.includes('phone') && (
            <div className="reminder-details-channel">
              <span>📱 Phone</span>
              <span className={`reminder-details-status ${reminder.sentStatus?.phone ? 'sent' : 'pending'}`}>
                {reminder.sentStatus?.phone ? '✔ Sent' : '⏳ Pending'}
              </span>
            </div>
          )}
          {reminder.methods?.includes('whatsapp') && (
            <div className="reminder-details-channel">
              <span>💬 WhatsApp</span>
              <span className={`reminder-details-status ${reminder.sentStatus?.whatsapp ? 'sent' : 'pending'}`}>
                {reminder.sentStatus?.whatsapp ? '✔ Sent' : '⏳ Pending'}
              </span>
            </div>
          )}
        </div>
        <div className="reminder-details-section-title">Reminder Timeline</div>
        <div className="reminder-details-timeline">
          <div className="reminder-details-timeline-item">
            <span className="reminder-details-timeline-dot done" />
            <div>
              <div className="reminder-details-timeline-title">Reminder Created</div>
              <div className="reminder-details-timeline-time">{formatDateTime(reminder.createdAt || new Date())}</div>
            </div>
          </div>
          {reminder.methods?.map(m => (
            <div className="reminder-details-timeline-item" key={m}>
              <span className={`reminder-details-timeline-dot${reminder.sentStatus?.[m] ? ' done' : ''}`} />
              <div>
                <div className="reminder-details-timeline-title">{m === 'email' ? 'Email Notification' : m === 'phone' ? 'SMS Notification' : 'WhatsApp Notification'}</div>
                <div className="reminder-details-timeline-time">
                  {reminder.sentStatus?.[m] ? `Sent on ${formatDateTime(reminder.dateTime)}` : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="reminder-details-footer">
          <div>Created: {formatDateTime(reminder.createdAt || new Date())}</div>
          <div>Last updated: {formatDateTime(reminder.updatedAt || reminder.createdAt || new Date())}</div>
        </div>
      </div>
    </div>
  );
} 