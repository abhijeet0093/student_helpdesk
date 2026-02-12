import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import '../styles/AdminComplaints.css';

const StaffComplaints = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
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

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdate(complaint.status);
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      alert('Please select a status');
      return;
    }

    try {
      await api.patch(`/staff/complaints/${selectedComplaint.complaintId}/status`, {
        status: statusUpdate,
        remark: remark
      });
      
      alert('Status updated successfully');
      setShowModal(false);
      setStatusUpdate('');
      setRemark('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
      console.error('Update error:', err);
    }
  };

  const getFilteredComplaints = () => {
    let filtered = complaints;

    if (filter !== 'all') {
      if (filter === 'pending') {
        filtered = filtered.filter(c => c.status === 'Pending');
      } else if (filter === 'inprogress') {
        filtered = filtered.filter(c => c.status === 'In Progress');
      } else if (filter === 'resolved') {
        filtered = filtered.filter(c => c.status === 'Resolved');
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();

  if (loading) {
    return <Loader message="Loading complaints..." />;
  }

  return (
    <div className="admin-complaints-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">
              ← Back
            </button>
            <h1>My Assigned Complaints</h1>
          </div>
          <button onClick={() => logout()} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="controls-section">
          <div className="filter-tabs">
            <button
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({complaints.length})
            </button>
            <button
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({complaints.filter(c => c.status === 'Pending').length})
            </button>
            <button
              className={filter === 'inprogress' ? 'active' : ''}
              onClick={() => setFilter('inprogress')}
            >
              In Progress ({complaints.filter(c => c.status === 'In Progress').length})
            </button>
            <button
              className={filter === 'resolved' ? 'active' : ''}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({complaints.filter(c => c.status === 'Resolved').length})
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by student name, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="complaints-table-wrapper">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No complaints assigned to you
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint._id}>
                    <td>{complaint.complaintId}</td>
                    <td>
                      <div>{complaint.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {complaint.studentRollNumber}
                      </div>
                    </td>
                    <td>{complaint.category}</td>
                    <td className="description-cell">
                      {complaint.description?.substring(0, 50)}...
                    </td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetails(complaint)}
                      >
                        View & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* View & Update Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details & Update</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>ID:</strong> {selectedComplaint.complaintId}
              </div>
              <div className="detail-row">
                <strong>Student:</strong> {selectedComplaint.studentName} ({selectedComplaint.studentRollNumber})
              </div>
              <div className="detail-row">
                <strong>Department:</strong> {selectedComplaint.studentDepartment}
              </div>
              <div className="detail-row">
                <strong>Category:</strong> {selectedComplaint.category}
              </div>
              <div className="detail-row">
                <strong>Description:</strong> {selectedComplaint.description}
              </div>
              <div className="detail-row">
                <strong>Current Status:</strong> <StatusBadge status={selectedComplaint.status} />
              </div>
              <div className="detail-row">
                <strong>Created:</strong> {new Date(selectedComplaint.createdAt).toLocaleString()}
              </div>
              
              <div className="status-update-section">
                <h3>Update Status</h3>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="form-select"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                
                <textarea
                  placeholder="Add resolution note or remark..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="form-textarea"
                  rows="4"
                />
                
                <button className="btn-primary" onClick={handleStatusUpdate}>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffComplaints;
