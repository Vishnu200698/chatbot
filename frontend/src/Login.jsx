import React, { useState } from 'react';
import './Auth.css';

const Login = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) onLogin(data.email);
      else setError(data.error);
    } catch (err) { setError("Connection failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="blob blob-blue"></div>
      <div className="blob blob-purple"></div>
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Log in to chat with Friday</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="auth-btn" disabled={loading}>{loading ? 'Connecting...' : 'Login'}</button>
        </form>
        <div className="auth-footer">
          New here? <span onClick={onSwitch}>Create account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;