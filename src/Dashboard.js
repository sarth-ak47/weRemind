import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ChannelVerification from './components/ChannelVerification';
import AddReminderModal from './components/AddReminderModal';
import ReminderList from './components/ReminderList';
import ReminderDetailsModal from './components/ReminderDetailsModal';
import './Dashboard.css';
import { FaBars } from 'react-icons/fa';

function ChannelConnectModal({ type, onClose, onRegistered, registeredValue }) {
  const [value, setValue] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [step, setStep] = useState('input');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const label = type === 'email' ? 'Email Address' : 'Phone Number';
  const placeholder = type === 'email' ? 'Enter your email' : 'Enter your phone number';

  const countryCodes = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+81', name: 'Japan' },
    { code: '+49', name: 'Germany' },
    { code: '+971', name: 'UAE' },
    { code: '+33', name: 'France' },
    { code: '+39', name: 'Italy' },
    { code: '+7', name: 'Russia' },
    // Add more as needed
  ];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let sendValue = value;
    if (type === 'phone' || type === 'whatsapp') {
      sendValue = countryCode + value;
    }
    const res = await fetch('https://weremind.onrender.com/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, value: sendValue })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Failed to send OTP');
    } else {
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('https://weremind.onrender.com/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type, value, otp })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Failed to verify OTP');
    } else {
      onRegistered(value);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        {step === 'input' ? (
          <form onSubmit={handleSendOtp}>
            <div className="modal-label">{label}</div>
            {type === 'phone' || type === 'whatsapp' ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <select className="modal-input" style={{ width: 100, flex: '0 0 100px' }} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.name})</option>
                  ))}
                </select>
                <input className="modal-input" type="text" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} required disabled={loading} style={{ flex: 1 }} />
              </div>
            ) : (
              <input className="modal-input" type="email" value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} required disabled={loading} />
            )}
            {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
            <div className="modal-actions">
              <button className="modal-btn modal-btn-primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="modal-label">Enter OTP sent to {value}</div>
            <input className="modal-input" type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" required disabled={loading} />
            {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
            <div className="modal-actions">
              <button className="modal-btn modal-btn-primary" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function NotificationChannels({ userChannels, onChannelRegistered }) {
  return (
    <main className="dashboard-main">
      <ChannelVerification />
    </main>
  );
}

function FeedbackSection() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch('https://weremind.onrender.com/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, user: currentUser?.email })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send feedback');
        return;
      }
      setSubmitted(true);
      setFeedback("");
    } catch (err) {
      setError('Failed to send feedback');
    }
  };
  return (
    <main className="dashboard-main">
      <div style={{
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '48px 64px',
        minWidth: '420px',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{fontWeight: 700, fontSize: '1.3em', marginBottom: 8}}>Send Feedback</h2>
        <div style={{color: '#666', marginBottom: 24}}>We value your opinion. Let us know what you think about the app.</div>
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div style={{fontWeight: 600, marginBottom: 8}}>Your Feedback</div>
          <textarea
            style={{
              width: '100%',
              minHeight: 100,
              borderRadius: 10,
              border: '1.5px solid #e0e0e0',
              padding: 16,
              fontSize: '1em',
              marginBottom: 24,
              resize: 'vertical',
            }}
            placeholder="Tell us what you think about the app..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#181818',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 600,
              fontSize: '1.1em',
              cursor: 'pointer',
              marginTop: 8,
              transition: 'background 0.2s',
            }}
          >
            Submit Feedback
          </button>
        </form>
        {submitted && <div style={{color: '#1abc1a', marginTop: 18, fontWeight: 600}}>Thank you for your feedback!</div>}
        {error && <div style={{color: 'red', marginTop: 12, fontWeight: 600}}>{error}</div>}
      </div>
    </main>
  );
}

function SettingsSection({ user }) {
  const [tab, setTab] = useState('account');
  return (
    <main className="dashboard-main">
      <div style={{width: '100%', maxWidth: 700, margin: '0 auto', padding: '32px 0'}}>
        <h1 style={{fontSize: '2.2rem', fontWeight: 700, marginBottom: 24}}>Settings</h1>
        <div style={{display: 'flex', gap: 12, marginBottom: 28}}>
          <button onClick={() => setTab('account')} style={{padding: '10px 32px', borderRadius: 8, border: 'none', background: tab === 'account' ? '#f5f5f5' : '#f9f9f9', fontWeight: 600, fontSize: '1.1em', cursor: 'pointer'}}>Account</button>
          <button onClick={() => setTab('plan')} style={{padding: '10px 32px', borderRadius: 8, border: 'none', background: tab === 'plan' ? '#f5f5f5' : '#f9f9f9', fontWeight: 600, fontSize: '1.1em', cursor: 'pointer'}}>Plan</button>
        </div>
        {tab === 'account' && (
          <>
            <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, marginBottom: 28, border: '1.5px solid #ececec'}}>
              <div style={{fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8}}>
                <span style={{fontSize: '1.1em'}}>Account Information</span>
              </div>
              <div style={{color: '#666'}}>Review and manage your account details.</div>
            </div>
            <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, marginBottom: 28, border: '1.5px solid #ececec'}}>
              <div style={{fontWeight: 700, marginBottom: 6}}>Profile</div>
              <div style={{color: '#888', marginBottom: 18}}>Your personal information and connected account.</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <div style={{width: 56, height: 56, borderRadius: '50%', background: '#c2185b', color: '#fff', fontWeight: 700, fontSize: '2em', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{user.displayName ? user.displayName[0] : user.email[0]}</div>
                <div>
                  <div style={{fontWeight: 600, fontSize: '1.1em'}}>{user.displayName || user.email}</div>
                  <div style={{color: '#888'}}>{user.email}</div>
                  <div style={{color: '#888', fontSize: '0.98em', marginTop: 2}}><span style={{fontSize: '1.1em', verticalAlign: 'middle'}}>G</span> Connected with google</div>
                </div>
              </div>
            </div>
            <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, border: '1.5px solid #ececec'}}>
              <div style={{fontWeight: 700, marginBottom: 6}}>Delete Account</div>
              <div style={{color: '#888', marginBottom: 14}}>Permanently remove your account and all associated data.</div>
              <div style={{background: '#fff0f0', border: '1.5px solid #f8bcbc', color: '#d32f2f', borderRadius: 8, padding: 12, marginBottom: 18, fontWeight: 500}}>
                <span style={{fontWeight: 700}}>Warning</span> This action cannot be undone. All your data will be permanently deleted.
              </div>
              <button style={{background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 600, fontSize: '1.1em', cursor: 'pointer'}}>Delete Account</button>
            </div>
          </>
        )}
        {tab === 'plan' && (
          <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 24, border: '1.5px solid #ececec'}}>
            <div style={{fontWeight: 700, marginBottom: 6}}>Plan</div>
            <div style={{color: '#888'}}>Your current plan details will appear here.</div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [selectedPage, setSelectedPage] = useState('reminders');
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode in localStorage
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const navigate = useNavigate();
  const [userChannels, setUserChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null);
  const [detailsReminder, setDetailsReminder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Fetch user channels
    async function fetchChannels() {
      if (!currentUser) return;
      setChannelsLoading(true);
      try {
        const res = await fetch(`https://weremind.onrender.com/api/otp/user-channels/${currentUser.uid}`);
        const data = await res.json();
        setUserChannels(data);
      } catch (e) {
        setUserChannels([]);
      } finally {
        setChannelsLoading(false);
      }
    }
    fetchChannels();
  }, [currentUser]);

  useEffect(() => {
    async function fetchUpcomingReminders() {
      try {
        const res = await fetch('https://weremind.onrender.com/api/reminders');
        const data = await res.json();
        // Filter to only upcoming reminders (dateTime in the future)
        const now = new Date();
        const upcoming = data.filter(rem => new Date(rem.dateTime) > now);
        setReminders(upcoming);
      } catch (e) {
        setReminders([]);
      }
    }
    fetchUpcomingReminders();
  }, []);

  // Helper to check if a date is today
  function isToday(date) {
    const d = new Date(date);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  }
  const remindersToday = reminders.filter(rem => isToday(rem.createdAt));

  const anyChannelConnected = userChannels && userChannels.some(ch => ch.isVerified);

  if (!currentUser) return null;

  const handleDeleteReminder = async (reminder) => {
    // Remove from backend
    await fetch(`https://weremind.onrender.com/api/reminders/${reminder._id || reminder.id}`, { method: 'DELETE' });
    // Remove from UI
    setReminders(prev => prev.filter(r => (r._id || r.id) !== (reminder._id || reminder.id)));
  };

  return (
    <div className={`dashboard-root${darkMode ? ' dark' : ''}`}>
      {/* Hamburger for mobile - always visible at top left on mobile */}
      <button
        className="dashboard-hamburger"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open navigation menu"
      >
        <FaBars size={24} />
      </button>
      {/* Overlay for drawer on mobile */}
      {drawerOpen && (
        <div
          className="dashboard-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      {/* Sidebar as drawer on mobile */}
      <aside className={`dashboard-sidebar${drawerOpen ? ' open' : ''}`}>
        <button
          className="dashboard-drawer-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation menu"
        >
          ×
        </button>
        <div className="dashboard-logo-area">
          <div className="dashboard-logo">wR</div>
          <span className="dashboard-site-name">weRemind</span>
        </div>
        <nav className="dashboard-nav">
          <div className="dashboard-nav-section">
            <div className={`dashboard-nav-item${selectedPage === 'reminders' ? ' active' : ''}`} onClick={() => setSelectedPage('reminders')}>Upcoming Reminders</div>
            <div className={`dashboard-nav-item${selectedPage === 'channels' ? ' active' : ''}`} onClick={() => setSelectedPage('channels')}>Notification Channels</div>
            <div className="dashboard-nav-item disabled">Integrations <span className="soon">Soon</span></div>
            <div className="dashboard-nav-item disabled">Analytics <span className="soon">Soon</span></div>
          </div>
        </nav>
        <div className="dashboard-reminders-usage">
          <div>Reminders</div>
          <div>{remindersToday.length}/100</div>
          <div className="dashboard-progress-bar">
            <div className="dashboard-progress" style={{width: `${(remindersToday.length / 100) * 100}%`}}></div>
          </div>
          <div className="dashboard-usage-label">{((remindersToday.length / 100) * 100).toFixed(1)}% used</div>
        </div>
        <div className="dashboard-user-section">
          <div className="dashboard-user-avatar">{currentUser.displayName ? currentUser.displayName[0] : currentUser.email[0]}</div>
          <div className="dashboard-user-info">
            <div className="dashboard-user-name">{currentUser.displayName || currentUser.email}</div>
          </div>
        </div>
        <div className="dashboard-sidebar-links">
          <div className="dashboard-sidebar-link" onClick={() => setSelectedPage('feedback')}>Feedback</div>
          <div className="dashboard-sidebar-link" onClick={() => setSelectedPage('settings')}>Settings</div>
          <div className="dashboard-sidebar-link" onClick={() => navigate('/')}>Home</div>
          <div className="dashboard-sidebar-link" onClick={() => setDarkMode(dm => !dm)}>{darkMode ? 'Light Mode' : 'Dark Mode'}</div>
          <div className="dashboard-sidebar-link" onClick={logout}>Logout</div>
        </div>
      </aside>
      {selectedPage === 'reminders' ? (
        <main className="dashboard-main">
          <div className="dashboard-reminders-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h2>Reminders</h2>
              <button
                className="dashboard-add-channel-btn"
                onClick={() => setShowAddReminder(true)}
                style={{ marginLeft: 16 }}
              >
                + Add Reminder
              </button>
            </div>
            <ReminderList
              reminders={reminders}
              onEdit={rem => setEditingReminder(rem)}
              onDetails={rem => setDetailsReminder(rem)}
              onDelete={handleDeleteReminder}
            />
            {reminders.length === 0 && (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">🔔</div>
                <div className="dashboard-empty-title">
                  {anyChannelConnected ? 'No Reminders Yet' : 'No Notification Channels'}
                </div>
                <div className="dashboard-empty-desc">
                  {anyChannelConnected
                    ? 'Start by adding a reminder!'
                    : 'Add a notification channel to start creating reminders.'}
                </div>
                <button
                  className="dashboard-add-channel-btn"
                  onClick={() => anyChannelConnected ? setShowAddReminder(true) : setSelectedPage('channels')}
                >
                  {anyChannelConnected ? 'Add Reminder' : 'Add Channel'}
                </button>
              </div>
            )}
            <AddReminderModal
              open={showAddReminder || !!editingReminder}
              onClose={() => { setShowAddReminder(false); setEditingReminder(null); }}
              onAdd={async (reminder) => {
                // Get verified contacts
                const contacts = { email: '', phone: '', whatsapp: '' };
                userChannels.forEach(ch => {
                  if (ch.isVerified) contacts[ch.channelType] = ch.contact;
                });
                const payload = {
                  ...reminder,
                  email: contacts.email,
                  phone: contacts.phone,
                  whatsapp: contacts.whatsapp
                };
                // Save to backend
                const res = await fetch('https://weremind.onrender.com/api/reminders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                  setReminders(prev => [...prev, { ...data, id: data._id }]);
                }
                setShowAddReminder(false);
                setEditingReminder(null);
              }}
              userChannels={userChannels}
              {...(editingReminder ? { initial: editingReminder } : {})}
            />
            <ReminderDetailsModal
              open={!!detailsReminder}
              reminder={detailsReminder}
              onClose={() => setDetailsReminder(null)}
            />
          </div>
        </main>
      ) : selectedPage === 'channels' ? (
        <NotificationChannels userChannels={userChannels} onChannelRegistered={(type, val) => setUserChannels(ch => ({ ...ch, [type]: val }))} />
      ) : selectedPage === 'feedback' ? (
        <FeedbackSection />
      ) : selectedPage === 'settings' ? (
        <SettingsSection user={currentUser} />
      ) : null}
    </div>
  );
} 