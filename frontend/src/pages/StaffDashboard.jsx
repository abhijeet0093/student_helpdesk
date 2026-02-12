import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff/complaints');
      
      if (response.data.success) {
        setComplaints(response.data.data.complaints);
      }
    } catch (err) {
      setError('Failed to load complaints');
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length
    };
  };

  const stats = getStats();

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchAssignedComplaints} className="retry-btn">
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
            <h1>Staff Dashboard</h1>
            <p className="header-subtitle">Welcome, {user?.name || 'Staff'}</p>
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
          <h2 className="section-title">My Assigned Complaints</h2>
          <div className="summary-grid">
            <div className="summary-card" style={{ borderLeftColor: '#667eea' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">📋</span>
                  <h3 className="summary-card-title">Total Assigned</h3>
                </div>
                <p className="summary-card-value">{stats.total}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#ff9800' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">⏳</span>
                  <h3 className="summary-card-title">Pending</h3>
                </div>
                <p className="summary-card-value">{stats.pending}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#2196f3' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">🔄</span>
                  <h3 className="summary-card-title">In Progress</h3>
                </div>
                <p className="summary-card-value">{stats.inProgress}</p>
              </div>
            </div>

            <div className="summary-card" style={{ borderLeftColor: '#4caf50' }}>
              <div className="summary-card-content">
                <div className="summary-card-header">
                  <span className="summary-card-icon">✅</span>
                  <h3 className="summary-card-title">Resolved</h3>
                </div>
                <p className="summary-card-value">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn action-btn-primary"
              onClick={() => navigate('/staff/complaints')}
            >
              <span className="action-icon">📋</span>
              <span>View All Complaints</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/staff/results')}
            >
              <span className="action-icon">📊</span>
              <span>UT Results</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/staff/complaints?status=pending')}
            >
              <span className="action-icon">⏳</span>
              <span>Pending Complaints</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
