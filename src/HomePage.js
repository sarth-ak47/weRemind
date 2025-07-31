import React, { useRef, useState } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { FaBars } from 'react-icons/fa';

export default function HomePage() {
  const contactRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleContactClick = (e) => {
    e.preventDefault();
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="wr-root">
      <NavBar
        onContactClick={handleContactClick}
        onHomeClick={handleHomeClick}
        onLogin={handleLogin}
        onLogout={handleLogout}
        user={currentUser}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <HeroSection onStartReminding={handleLogin} />
      <DashboardPreview onAddReminder={handleLogin} />
      <FeaturesGrid />
      <Footer contactRef={contactRef} />
    </div>
  );
}

function NavBar({ onContactClick, onHomeClick, onLogin, onLogout, user, mobileMenuOpen, setMobileMenuOpen }) {
  const navigate = useNavigate();
  return (
    <nav className="wr-navbar">
      {/* Logo - always visible */}
      <div className="wr-logo-area">
        <div className="wr-logo">wR</div>
        <span className="wr-site-name">weRemind</span>
      </div>
      
      {/* Hamburger for mobile */}
      {!mobileMenuOpen && (
        <button
          className="wr-hamburger"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FaBars size={24} />
        </button>
      )}
      
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="wr-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile menu */}
      <div className={`wr-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        <button
          className="wr-mobile-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        >
          ×
        </button>
        <div className="wr-mobile-menu-content">
          <div className="wr-mobile-nav-links">
            <a href="#home" onClick={onHomeClick}>Home</a>
            <a href="#contact" onClick={onContactClick}>Contact</a>
            {user && (
              <a href="#dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard'); setMobileMenuOpen(false); }}>Dashboard</a>
            )}
          </div>
          <div className="wr-mobile-login">
            {user ? (
              <>
                <span className="wr-mobile-user-greet">Hello, {user.displayName || user.email}</span>
                <button className="wr-mobile-login-btn" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <button className="wr-mobile-login-btn" onClick={onLogin}>Login</button>
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop navbar */}
      <div className="wr-desktop-nav">
      <div className="wr-nav-links">
        <a href="#home" onClick={onHomeClick}>Home</a>
        <a href="#contact" onClick={onContactClick}>Contact</a>
        {user && (
          <a href="#dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
        )}
      </div>
      <div className="wr-login">
        {user ? (
          <>
            <span className="wr-user-greet">Hello, {user.displayName || user.email}</span>
            <button className="wr-login-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="wr-login-btn" onClick={onLogin}>Login</button>
        )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onStartReminding }) {
  return (
    <section className="wr-hero">
      <h1 className="wr-hero-title">Never Miss Important Reminders Again</h1>
      <p className="wr-hero-desc">
        weRemind seamlessly integrates with your favorite platforms to deliver timely reminders through WhatsApp, Email, and Push Notifications. Stay organized effortlessly.
      </p>
      <div className="wr-hero-call">We call you to remind you.</div>
      <div className="wr-hero-cta">
        <button className="wr-cta-btn" onClick={onStartReminding}>Start Reminding</button>
        <button className="wr-cta-btn wr-cta-secondary">Explore Features →</button>
      </div>
    </section>
  );
}

function DashboardPreview({ onAddReminder }) {
  return (
    <section className="wr-dashboard-preview">
      <div className="wr-dashboard-card">
        <div className="wr-dashboard-header">
          <span className="wr-dashboard-title">Reminders</span>
          <button className="wr-add-reminder" onClick={onAddReminder}>+ Add Reminder</button>
        </div>
        <div className="wr-reminder-list">
          <ReminderItem title="Remind me to wash the car" time="Sep 7, 2024, 12:30 PM" />
          <ReminderItem title="Meeting with the Marketing Team" time="Sep 10, 2024, 2:00 PM" />
        </div>
      </div>
    </section>
  );
}

function ReminderItem({ title, time }) {
  return (
    <div className="wr-reminder-item">
      <div className="wr-reminder-dot" />
      <div>
        <div className="wr-reminder-title">{title}</div>
        <div className="wr-reminder-time">{time}</div>
      </div>
    </div>
  );
}

function FeaturesGrid() {
  const features = [
    { icon: '🔔', title: 'Multi-Channel Reminders', desc: 'Get notified via WhatsApp, Email, or Push Notifications.' },
    { icon: '🔄', title: 'Recurring Reminders', desc: 'Set up repeating reminders for daily, weekly, or monthly tasks.' },
    { icon: '📅', title: 'Calendar Integration', desc: 'Sync your reminders with Google and Outlook calendars.' },
    { icon: '🤖', title: 'Smart Scheduling', desc: 'Our AI helps you find the best times for your reminders.' },
    { icon: '☁️', title: 'Cloud Backup', desc: 'Never lose your important reminders with automatic cloud backups.' },
    { icon: '⚡', title: 'Real-Time Feed', desc: 'Stay up-to-date with a dynamic feed of your upcoming reminders.' },
    { icon: '🛡️', title: 'Privacy First', desc: 'Your data is encrypted and never shared.' },
    { icon: '💬', title: '24/7 Support', desc: 'Our dedicated team is always here to help you.' },
  ];
  return (
    <section className="wr-features-grid">
      {features.map((f, i) => (
        <div className="wr-feature-card" key={i}>
          <div className="wr-feature-icon">{f.icon}</div>
          <div className="wr-feature-title">{f.title}</div>
          <div className="wr-feature-desc">{f.desc}</div>
        </div>
      ))}
    </section>
  );
}

function Footer({ contactRef }) {
  return (
    <footer className="wr-footer" ref={contactRef} id="contact">
      <div className="wr-footer-content">
        <h2>Contact Us</h2>
        <div>Email: <a href="mailto:sarthakvarsh9696@gmail.com">sarthakvarsh9696@gmail.com</a></div>
        <div>Phone: <a href="tel:+919696351509">9696351509</a></div>
        <div>Address: Law Gate, Phagwara, Punjab</div>
      </div>
    </footer>
  );
} 