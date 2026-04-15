import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const MyComplaints = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshMessage, setRefreshMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  // Tab: 'active' | 'archived'
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  const ACTIVE_STATUSES = ['Pending', 'In Progress', 'Escalated'];
  const ARCHIVED_STATUSES = ['Resolved', 'Rejected'];

  // Split by tab
  const activeComplaints = complaints.filter(c => ACTIVE_STATUSES.includes(c.status));
  const archivedComplaints = complaints.filter(c => ARCHIVED_STATUSES.includes(c.status));
  const tabComplaints = activeTab === 'active' ? activeComplaints : archivedComplaints;

  useEffect(() => {
    fetchComplaints();
    const handleFocus = () => fetchComplaints(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchComplaints = async (isRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      setRefreshMessage('');
      const response = await api.get('/complaints/my');
      setComplaints(response.data.data || []);
      if (isRefresh) {
        setRefreshMessage('Complaints updated successfully!');
        setTimeout(() => setRefreshMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getFilteredComplaints = () => {
    let list = tabComplaints;
    // Status sub-filter (only meaningful on active tab)
    if (filter !== 'all') {
      const map = { pending: 'Pending', inProgress: 'In Progress', resolved: 'Resolved', escalated: 'Escalated', rejected: 'Rejected' };
      if (map[filter]) list = list.filter(c => c.status === map[filter]);
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.complaintId?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.rating) return;
    try {
      setFeedbackSubmitting(true);
      await api.post(`/complaints/${feedbackModal._id}/feedback`, feedbackForm);
      setFeedbackModal(null);
      setFeedbackForm({ rating: 0, comment: '' });
      fetchComplaints(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Raise Complaint', path: '/complaints/new', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )},
    { name: 'My Complaints', path: '/complaints', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { name: 'UT Results', path: '/results', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Student Corner', path: '/corner', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    )},
    { name: 'AI Assistant', path: '/ai-chat', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )},
  ];

  const filteredComplaints = getFilteredComplaints();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
        <div className="p-6 border-b border-indigo-500/30 relative z-10 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm animate-float">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Smart Campus</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right group ${
                  isActive ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/50 scale-105'
                           : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105 hover:shadow-md'
                }`}>
                <span className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-indigo-500/30 relative z-10">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all duration-300 z-20">
          <svg className={`w-4 h-4 transform transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center animate-slide-up sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">My Complaints</h1>
            <p className="text-sm text-gray-600">Track your submitted complaints</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchComplaints(true)} disabled={loading}
              className="p-2.5 text-gray-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 hover:scale-110 group disabled:opacity-50">
              <svg className={`w-5 h-5 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={() => navigate('/complaints/new')}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Raise Complaint
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {user?.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.rollNumber || 'Student'}</p>
                <p className="text-xs text-indigo-600 font-medium">{user?.department || ''}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Active / Archived Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-1.5 mb-4 flex gap-1 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <button onClick={() => { setActiveTab('active'); setFilter('all'); }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              Active
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {activeComplaints.length}
              </span>
            </button>
            <button onClick={() => { setActiveTab('archived'); setFilter('all'); }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'archived'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              Archived
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'archived' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {archivedComplaints.length}
              </span>
            </button>
          </div>

          {/* Search + Status Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, ID or category..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
              />
            </div>
            {/* Status sub-filter */}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'active' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="escalated">Escalated</option>
                </>
              ) : (
                <>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
            </select>
          </div>

          {/* Messages */}
          {refreshMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-4 animate-slide-up flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{refreshMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-4 flex justify-between items-center">
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={fetchComplaints} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16"><Loader message="Loading complaints..." /></div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-16 text-center animate-scale-in">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-500 mb-6">{filter === 'all' ? "You haven't raised any complaints yet." : `No ${filter} complaints.`}</p>
                  <button onClick={() => navigate('/complaints/new')}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Raise Your First Complaint
                  </button>
                </div>
              ) : (
                filteredComplaints.map((complaint, idx) => (
                  <div key={complaint._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-slide-up hover:-translate-y-1 shine-effect"
                    style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{complaint.complaintId}</h3>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">{complaint.category}</span>
                        {complaint.isEscalated && complaint.status !== 'Resolved' && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
                            ⚠️ Escalated
                          </span>
                        )}
                      </div>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{complaint.title}</h4>
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">{complaint.description}</p>
                    {complaint.image && (
                      <div className="mb-4 rounded-xl overflow-hidden">
                        <img src={`http://localhost:3001${complaint.image}`} alt="Complaint" className="w-full max-w-sm h-auto object-cover" />
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.priority === 'high' ? 'bg-red-100 text-red-700' :
                          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>Priority: {complaint.priority}</span>
                        {complaint.assignedTo && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Assigned: {complaint.assignedTo.name}</span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>Created: {formatDate(complaint.createdAt)}</span>
                        <span>Updated: {formatDate(complaint.updatedAt)}</span>
                      </div>
                    </div>
                    {complaint.adminRemarks && (
                      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
                        <p className="text-sm"><span className="font-bold text-blue-900">Admin Remarks: </span><span className="text-blue-800">{complaint.adminRemarks}</span></p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                        📋 {expandedId === complaint._id ? 'Hide' : 'View'} History
                      </button>
                      {complaint.status === 'Resolved' && !complaint.feedback?.rating && (
                        <button
                          onClick={() => { setFeedbackModal(complaint); setFeedbackForm({ rating: 0, comment: '' }); }}
                          className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1">
                          ⭐ Give Feedback
                        </button>
                      )}
                      {complaint.feedback?.rating && (
                        <span className="px-3 py-1.5 text-xs font-semibold bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-1">
                          {'⭐'.repeat(complaint.feedback.rating)} Feedback given
                        </span>
                      )}
                    </div>

                    {/* History Timeline */}
                    {expandedId === complaint._id && complaint.statusHistory?.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Complaint History</p>
                        <div className="space-y-3">
                          {complaint.statusHistory.map((h, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{h.status} <span className="text-gray-400 font-normal">by {h.changedByName || 'System'}</span></p>
                                {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                                <p className="text-xs text-gray-400">{formatDate(h.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Rate Resolution</h3>
            <p className="text-sm text-gray-500 mb-4">{feedbackModal.title}</p>
            <div className="flex gap-2 mb-4 justify-center">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setFeedbackForm(f => ({ ...f, rating: star }))}
                  className={`text-3xl transition-transform hover:scale-110 ${feedbackForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={feedbackForm.comment}
              onChange={e => setFeedbackForm(f => ({ ...f, comment: e.target.value }))}
              placeholder="Optional comment about the resolution..."
              rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setFeedbackModal(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleFeedbackSubmit} disabled={!feedbackForm.rating || feedbackSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-lg transition-all">
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
