import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [userType, setUserType] = useState('student'); // student, admin, staff
  const [formData, setFormData] = useState({
    rollNumber: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear form fields on component mount (after logout)
  useEffect(() => {
    setFormData({
      rollNumber: '',
      username: '',
      email: '',
      password: '',
    });
    setError('');
  }, []);

  // Clear form fields when user type changes
  useEffect(() => {
    setFormData({
      rollNumber: '',
      username: '',
      email: '',
      password: '',
    });
    setError('');
  }, [userType]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let credentials = {};
      
      if (userType === 'student') {
        credentials = {
          rollNumber: formData.rollNumber,
          password: formData.password,
        };
      } else if (userType === 'admin') {
        credentials = {
          username: formData.username,
          password: formData.password,
        };
      } else if (userType === 'staff') {
        credentials = {
          email: formData.email,
          password: formData.password,
        };
      }

      await login(credentials, userType);
      
      // Clear form after successful login
      setFormData({
        rollNumber: '',
        username: '',
        email: '',
        password: '',
      });
      
      // Redirect based on role
      if (userType === 'student') {
        navigate('/dashboard');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      } else if (userType === 'staff') {
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Smart Campus Helpdesk</h1>
        <p className="subtitle">Student Ecosystem</p>

        {/* User Type Selector */}
        <div className="user-type-selector">
          <button
            type="button"
            className={userType === 'student' ? 'active' : ''}
            onClick={() => setUserType('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={userType === 'admin' ? 'active' : ''}
            onClick={() => setUserType('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={userType === 'staff' ? 'active' : ''}
            onClick={() => setUserType('staff')}
          >
            Staff
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {userType === 'student' && (
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                autoComplete="off"
                required
              />
            </div>
          )}

          {userType === 'admin' && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                autoComplete="off"
                required
              />
            </div>
          )}

          {userType === 'staff' && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="off"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="off"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {userType === 'student' && (
          <p className="register-link">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
