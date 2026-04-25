import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaApple } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { TfiFacebook } from 'react-icons/tfi';
import { register } from '../services/api';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', roleName: 'Intern' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(form);
      if (form.roleName === 'Mentor') {
        alert(res.data.message); // "pending admin approval"
        navigate('/login');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="subtitle">Start learning with TalentFlow today</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="user@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
              <option value="Intern">Intern</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} placeholder="Create password (min 6 chars)"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
              <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁'}</span>
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <p className="terms">By signing up, you agree to our <span>Terms of service</span> and <span>Privacy Policy</span></p>
          <div className="divider"><span /><p>or sign up with</p><span /></div>
          <div className="socials">
            <button type="button"><FaApple /></button>
            <button type="button"><FcGoogle /></button>
            <button type="button"><TfiFacebook /></button>
          </div>
          <p className="auth-switch">Already have an account? <Link to="/login">Log In</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
