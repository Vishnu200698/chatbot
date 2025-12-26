import React, { useState } from 'react';
import './Auth.css';

const Signup = ({ onSignup, onSwitch }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Unified change handler for all fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) onSignup(data.email);
      else setError(data.error);
    } catch (err) { setError("Connection failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="blob blob-blue"></div>
      <div className="blob blob-purple"></div>
      <div className="auth-card" style={{ maxWidth: '500px' }}> {/* Slightly wider for more fields */}
        <h1>Create Account</h1>
        <p>Join the future with Friday AI</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="input-row"> {/* Side-by-side fields */}
            <div className="input-group">
              <label>First name</label>
              <input name="Firstname" type="text" placeholder="john" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input name="LastName" type="text" placeholder="Doe" onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Phone Number (Optional)</label>
            <input name="phone" type="tel" placeholder="+1 234 567 890" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Joined already? <span onClick={onSwitch}>Login here</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;