import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './ChannelVerification.css';

const countryCodes = [
  { code: '+1', label: '🇺🇸 US' },
  { code: '+91', label: '🇮🇳 IN' },
  { code: '+44', label: '🇬🇧 UK' },
  { code: '+61', label: '🇦🇺 AU' },
  { code: '+81', label: '🇯🇵 JP' },
  // Add more as needed
];

const ChannelVerification = () => {
  const { currentUser } = useAuth();
  const [channels, setChannels] = useState({
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [verifiedChannels, setVerifiedChannels] = useState({});
  const [otpInputs, setOtpInputs] = useState({
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [loading, setLoading] = useState({
    email: false,
    phone: false,
    whatsapp: false
  });
  const [verifying, setVerifying] = useState({
    email: false,
    phone: false,
    whatsapp: false
  });
  const [messages, setMessages] = useState({
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');

  useEffect(() => {
    if (currentUser) {
      fetchUserChannels();
    }
  }, [currentUser]);

  const fetchUserChannels = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/otp/user-channels/${currentUser.uid}`);
      const data = await response.json();
      
      const verified = {};
      data.forEach(channel => {
        if (channel.isVerified) {
          verified[channel.channelType] = channel.contact;
        }
      });
      setVerifiedChannels(verified);
    } catch (error) {
      console.error('Error fetching user channels:', error);
    }
  };

  const handleInputChange = (channelType, value) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: value
    }));
    setMessages(prev => ({
      ...prev,
      [channelType]: ''
    }));
  };

  const handleOtpChange = (channelType, value) => {
    setOtpInputs(prev => ({
      ...prev,
      [channelType]: value
    }));
  };

  const sendOTP = async (channelType) => {
    let contact = channels[channelType];
    if (!contact) {
      setMessages(prev => ({
        ...prev,
        [channelType]: 'Please enter a valid contact'
      }));
      return;
    }
    // For phone, prepend country code
    if (channelType === 'phone') {
      if (!contact.startsWith('+')) {
        contact = phoneCountryCode + contact;
      }
    }
    setLoading(prev => ({ ...prev, [channelType]: true }));
    setMessages(prev => ({ ...prev, [channelType]: '' }));

    try {
      const response = await fetch('http://localhost:4000/api/otp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          channelType,
          contact
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => ({
          ...prev,
          [channelType]: `OTP sent to ${contact}`
        }));
      } else {
        setMessages(prev => ({
          ...prev,
          [channelType]: data.error || 'Failed to send OTP'
        }));
      }
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [channelType]: 'Failed to send OTP'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [channelType]: false }));
    }
  };

  const verifyOTP = async (channelType) => {
    let contact = channels[channelType];
    const otp = otpInputs[channelType];

    if (!otp) {
      setMessages(prev => ({
        ...prev,
        [channelType]: 'Please enter the OTP'
      }));
      return;
    }
    // For phone, prepend country code
    if (channelType === 'phone') {
      if (!contact.startsWith('+')) {
        contact = phoneCountryCode + contact;
      }
    }
    setVerifying(prev => ({ ...prev, [channelType]: true }));

    try {
      const response = await fetch('http://localhost:4000/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          channelType,
          contact,
          otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => ({
          ...prev,
          [channelType]: 'Channel verified successfully!'
        }));
        setVerifiedChannels(prev => ({
          ...prev,
          [channelType]: contact
        }));
        setChannels(prev => ({ ...prev, [channelType]: '' }));
        setOtpInputs(prev => ({ ...prev, [channelType]: '' }));
      } else {
        setMessages(prev => ({
          ...prev,
          [channelType]: data.error || 'Failed to verify OTP'
        }));
      }
    } catch (error) {
      setMessages(prev => ({
        ...prev,
        [channelType]: 'Failed to verify OTP'
      }));
    } finally {
      setVerifying(prev => ({ ...prev, [channelType]: false }));
    }
  };

  const renderChannelSection = (channelType, label, placeholder) => {
    const isVerified = verifiedChannels[channelType];
    const contact = channels[channelType];
    const otp = otpInputs[channelType];
    const isLoading = loading[channelType];
    const isVerifying = verifying[channelType];
    const message = messages[channelType];

    return (
      <div className="channel-section">
        <h3>{label}</h3>
        
        {isVerified ? (
          <div className="verified-channel">
            <span className="verified-icon">✅</span>
            <span className="verified-text">Connected: {isVerified}</span>
            <button 
              className="disconnect-btn"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `http://localhost:4000/api/otp/disconnect-channel/${currentUser.uid}/${channelType}`,
                    { method: 'DELETE' }
                  );
                  
                  if (response.ok) {
                    setVerifiedChannels(prev => {
                      const updated = { ...prev };
                      delete updated[channelType];
                      return updated;
                    });
                    setMessages(prev => ({
                      ...prev,
                      [channelType]: 'Channel disconnected successfully'
                    }));
                  } else {
                    setMessages(prev => ({
                      ...prev,
                      [channelType]: 'Failed to disconnect channel'
                    }));
                  }
                } catch (error) {
                  console.error('Error disconnecting channel:', error);
                  setMessages(prev => ({
                    ...prev,
                    [channelType]: 'Failed to disconnect channel'
                  }));
                }
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="channel-inputs">
            <div className="input-group">
              {channelType === 'phone' && (
                <select
                  value={phoneCountryCode}
                  onChange={e => setPhoneCountryCode(e.target.value)}
                  disabled={isLoading}
                  style={{ marginRight: 8 }}
                >
                  {countryCodes.map(c => (
                    <option key={c.code} value={c.code}>{c.label} {c.code}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder={placeholder}
                value={contact}
                onChange={(e) => handleInputChange(channelType, e.target.value)}
                disabled={isLoading}
              />
              <button
                onClick={() => sendOTP(channelType)}
                disabled={isLoading || !contact}
                className="send-otp-btn"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
            
            {message && (
              <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            
            {contact && (
              <div className="otp-group">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => handleOtpChange(channelType, e.target.value)}
                  disabled={isVerifying}
                  maxLength={6}
                />
                <button
                  onClick={() => verifyOTP(channelType)}
                  disabled={isVerifying || !otp}
                  className="verify-otp-btn"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="channel-verification">
      <h2>Channel Verification</h2>
      <p>Connect your channels to receive reminders</p>
      
      {renderChannelSection('email', 'Email', 'Enter your email address')}
      {renderChannelSection('phone', 'Phone', 'Enter your phone number')}
      {/* WhatsApp Section - Paid Feature */}
      <div className="channel-section">
        <h3>WhatsApp <span className="paid-badge">Paid <span role="img" aria-label="lock">🔒</span></span></h3>
        <div className="paid-info">WhatsApp notifications are available for paid users only.</div>
      </div>
    </div>
  );
};

export default ChannelVerification; 