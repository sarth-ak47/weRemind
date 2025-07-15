import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { currentUser, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="wr-login-root">
      <button
        className="wr-login-back-arrow"
        onClick={() => navigate('/')}
        style={{ position: 'absolute', top: 24, left: 32, background: 'none', border: 'none', fontSize: '2em', cursor: 'pointer', color: '#222', zIndex: 10 }}
        aria-label="Back to Home"
      >
        ←
      </button>
      <div className="wr-login-card">
        <div className="wr-login-logo-large">
          <span className="wr-login-logo-text">R</span>
        </div>
        <h1 className="wr-login-welcome">Welcome to weRemind</h1>
        <div className="wr-login-subtitle">Sign in to start managing your reminders</div>
        {error && <div className="wr-login-error">{error}</div>}
        <button 
          className="wr-login-provider-btn wr-google-btn" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span style={{ fontWeight: 'bold', fontSize: '1.3em', color: '#4285F4', marginRight: 12 }}>G</span>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <div className="wr-login-terms">
          By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
} 