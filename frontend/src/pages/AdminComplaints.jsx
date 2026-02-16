import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const AdminComplaints = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
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
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Students', 
      path: '/admin/students', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Complaints', 
      path: '/admin/complaints', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'UT Results', 
      path: '/admin/results', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

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

    try {
      setAssigning(true);
      const response = await api.post(`/admin/complaints/${selectedComplaint.complaintId}/assign`, {
        staffId: selectedStaff
      });
      
      alert('Complaint assigned successfully');
      setShowAssignModal(false);
      setSelectedStaff('');
      fetchComplaints();
    } catch (err) {
      console.error('Assignment error:', err);
      alert(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) {
      alert('Please select a status');
      return;
    }

    try {
      setUpdating(true);
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
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader message="Loading complaints..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar - Same as Admin Dashboard */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold">Admin Panel</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg border-l-4 border-indigo-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-all duration-300"
        >
          <svg className={`w-4 h-4 transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Complaints</h1>
            <p className="text-sm text-gray-500">View, assign, and manage all complaints</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'inprogress', label: 'In Progress' },
                  { key: 'resolved', label: 'Resolved' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      filter === tab.key
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by ID, student, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Complaints Grid */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-600">
                {filter !== 'all' ? `No ${filter} complaints at the moment.` : 'No complaints have been raised yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{complaint.title}</h3>
                      <p className="text-sm text-gray-500">ID: {complaint.complaintId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{complaint.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{complaint.studentRollNumber}</span>
                      <span>•</span>
                      <span>{complaint.studentDepartment}</span>
                    </div>
                  </div>

                  {/* Category and Priority */}
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {complaint.category}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      complaint.priority === 'high' ? 'bg-red-100 text-red-700' :
                      complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {complaint.priority} priority
                    </span>
                  </div>

                  {/* Description Preview */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {complaint.description}
                  </p>

                  {/* Assignment Info */}
                  {complaint.assignedToName && (
                    <div className="bg-indigo-50 rounded-lg p-2 mb-4 text-xs">
                      <span className="text-indigo-700">
                        Assigned to: <span className="font-semibold">{complaint.assignedToName}</span>
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-4">
                    {new Date(complaint.createdAt).toLocaleDateString()} at {new Date(complaint.createdAt).toLocaleTimeString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(complaint)}
                      className="flex-1 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-all duration-200"
                    >
                      View Details
                    </button>
                    {!complaint.assignedTo && (
                      <button
                        onClick={() => handleAssignComplaint(complaint)}
                        className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-all duration-200"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View Details Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Complaint Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-500">Complaint ID</label>
                <p className="text-gray-900">{selectedComplaint.complaintId}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Title</label>
                <p className="text-gray-900 font-medium">{selectedComplaint.title}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Description</label>
                <p className="text-gray-700">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500">Category</label>
                  <p className="text-gray-900">{selectedComplaint.category}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Priority</label>
                  <p className="text-gray-900 capitalize">{selectedComplaint.priority}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              {selectedComplaint.image && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-2">Attachment</label>
                  <img src={selectedComplaint.image} alt="Complaint" className="rounded-xl max-h-64 object-cover" />
                </div>
              )}

              <div className="border-t pt-4">
                <label className="text-sm font-semibold text-gray-500 block mb-2">Update Status</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
                >
                  <option value="">Select status...</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Admin response (optional)"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || !statusUpdate}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Assign Complaint</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Select Staff Member</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose staff...</option>
                  {staffList.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} - {staff.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAssignment}
                  disabled={assigning || !selectedStaff}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
