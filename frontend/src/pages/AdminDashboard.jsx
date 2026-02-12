import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/complaints');
      
      if (response.data.success) {
        setStats(response.data.data.statistics);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="header-subtitle">Welcome, {user?.username || 'Admin'}</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="summary-section">
          <h2 className="section-title">Complaint Overview</h2>
          <div className="summary-grid">
            <div className="summary-card" style={{ borderLeftColor: '#667eea' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">📋</span>
                  <h3 className="summary-card-title">Total Complaints</h3>
                </div>
                <p className="summary-card-value">{stats?.total || 0}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#ff9800' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">⏳</span>
                  <h3 className="summary-card-title">Pending</h3>
                </div>
                <p className="summary-card-value">{stats?.pending || 0}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#2196f3' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">🔄</span>
                  <h3 className="summary-card-title">In Progress</h3>
                </div>
                <p className="summary-card-value">{stats?.inProgress || 0}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#4caf50' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">✅</span>
                  <h3 className="summary-card-title">Resolved</h3>
                </div>
                <p className="summary-card-value">{stats?.resolved || 0}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#f44336' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">❌</span>
                  <h3 className="summary-card-title">Rejected</h3>
                </div>
                <p className="summary-card-value">{stats?.rejected || 0}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn action-btn-primary"
              onClick={() => navigate('/admin/complaints')}
            >
              <span className="action-icon">📋</span>
              <span>Manage Complaints</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/admin/results')}
            >
              <span className="action-icon">📊</span>
              <span>UT Results</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/admin/students')}
            >
              <span className="action-icon">👥</span>
              <span>Manage Students</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
