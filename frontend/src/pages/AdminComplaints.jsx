import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import '../styles/AdminComplaints.css';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchStaffList();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/complaints');
      
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

  const fetchStaffList = async () => {
    try {
      const response = await api.get('/admin/staff');
      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const handleAssignComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowAssignModal(true);
  };

  const submitAssignment = async () => {
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    console.log('=== ASSIGN COMPLAINT DEBUG ===');
    console.log('Complaint ID:', selectedComplaint.complaintId);
    console.log('Staff ID:', selectedStaff);
    console.log('API Endpoint:', `/admin/complaints/${selectedComplaint.complaintId}/assign`);

    try {
      const response = await api.post(`/admin/complaints/${selectedComplaint.complaintId}/assign`, {
        staffId: selectedStaff
      });
      
      console.log('Assignment Response:', response.data);
      
      alert('Complaint assigned successfully');
      setShowAssignModal(false);
      setSelectedStaff('');
      fetchComplaints();
    } catch (err) {
      console.error('=== ASSIGN ERROR ===');
      console.error('Error Response:', err.response?.data);
      console.error('Error Status:', err.response?.status);
      console.error('Error Message:', err.message);
      alert(err.response?.data?.message || 'Failed to assign complaint');
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      alert('Please select a status');
      return;
    }

    try {
      await api.patch(`/admin/complaints/${selectedComplaint.complaintId}`, {
        status: statusUpdate,
        adminResponse: adminResponse
      });
      
      alert('Status updated successfully');
      setShowModal(false);
      setStatusUpdate('');
      setAdminResponse('');
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status');
      console.error('Update error:', err);
    }
  };

  const getFilteredComplaints = () => {
    let filtered = complaints;

    if (filter !== 'all') {
      filtered = filtered.filter(c => c.status.toLowerCase().replace(' ', '') === filter);
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
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
              ← Back
            </button>
            <h1>Manage Complaints</h1>
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
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    No complaints found
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
                    <td>{complaint.assignedToName || 'Unassigned'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(complaint)}
                        >
                          View
                        </button>
                        <button
                          className="btn-assign"
                          onClick={() => handleAssignComplaint(complaint)}
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* View Details Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
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
                <strong>Category:</strong> {selectedComplaint.category}
              </div>
              <div className="detail-row">
                <strong>Description:</strong> {selectedComplaint.description}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> <StatusBadge status={selectedComplaint.status} />
              </div>
              <div className="detail-row">
                <strong>Assigned To:</strong> {selectedComplaint.assignedToName || 'Unassigned'}
              </div>
              
              <div className="status-update-section">
                <h3>Update Status</h3>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                
                <textarea
                  placeholder="Admin response (optional)"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
                
                <button className="btn-primary" onClick={handleStatusUpdate}>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Complaint</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Complaint ID:</strong> {selectedComplaint.complaintId}</p>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              
              <div className="form-group">
                <label>Select Staff Member:</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose staff...</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} - {staff.department}
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="btn-primary" onClick={submitAssignment}>
                Assign Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
