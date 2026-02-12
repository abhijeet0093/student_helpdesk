import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loader while fetching data
  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  // Show error if fetch failed
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!dashboardData) {
    return (
      <div className="dashboard-container">
        <p>No dashboard data available</p>
      </div>
    );
  }

  const { studentInfo, complaintStats, recentComplaint } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Welcome, {studentInfo.name}!</h1>
            <p className="header-subtitle">
              {studentInfo.rollNumber} • {studentInfo.department} • Semester {studentInfo.semester}
            </p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Summary Section */}
        <section className="summary-section">
          <h2 className="section-title">Complaint Summary</h2>
          <div className="summary-grid">
            <SummaryCard
              title="Total Complaints"
              value={complaintStats.total}
              icon="📋"
              color="#667eea"
            />
            <SummaryCard
              title="Pending"
              value={complaintStats.byStatus.pending}
              icon="⏳"
              color="#ff9800"
            />
            <SummaryCard
              title="In Progress"
              value={complaintStats.byStatus.inProgress}
              icon="🔄"
              color="#2196f3"
            />
            <SummaryCard
              title="Resolved"
              value={complaintStats.byStatus.resolved}
              icon="✅"
              color="#4caf50"
            />
          </div>
        </section>

        {/* Latest Complaint Section */}
        <section className="latest-complaint-section">
          <h2 className="section-title">Latest Complaint</h2>
          {recentComplaint ? (
            <div className="complaint-card">
              <div className="complaint-header">
                <div>
                  <h3 className="complaint-id">{recentComplaint.complaintId}</h3>
                  <p className="complaint-category">{recentComplaint.category}</p>
                </div>
                <StatusBadge status={recentComplaint.status} />
              </div>
              <div className="complaint-footer">
                <p className="complaint-date">
                  Created: {formatDate(recentComplaint.createdAt)}
                </p>
                <p className="complaint-date">
                  Last Updated: {formatDate(recentComplaint.updatedAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="no-complaints">
              <p>No complaints raised yet</p>
              <p className="no-complaints-subtitle">
                Click "Raise New Complaint" to get started
              </p>
            </div>
          )}
        </section>

        {/* Quick Actions Section */}
        <section className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-btn action-btn-primary"
              onClick={() => navigate('/complaints/new')}
            >
              <span className="action-icon">➕</span>
              <span>Raise New Complaint</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/complaints')}
            >
              <span className="action-icon">📋</span>
              <span>View My Complaints</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/corner')}
            >
              <span className="action-icon">💬</span>
              <span>Student Corner</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/ai-chat')}
            >
              <span className="action-icon">🤖</span>
              <span>AI Study Assistant</span>
            </button>
            <button 
              className="action-btn action-btn-secondary"
              onClick={() => navigate('/results')}
            >
              <span className="action-icon">📊</span>
              <span>View UT Results</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
