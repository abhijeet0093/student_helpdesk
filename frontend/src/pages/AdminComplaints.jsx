import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const MENU = [
  { name: 'Dashboard', path: '/admin/dashboard' },
  { name: 'Students', path: '/admin/students' },
  { name: 'Complaints', path: '/admin/complaints' },
  { name: 'UT Results', path: '/admin/results' },
  { name: 'Staff', path: '/admin/staff' },
];

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Resolved: 'bg-green-100 text-green-700 border-green-200',
  Rejected: 'bg-red-100 text-red-700 border-red-200',
  Escalated: 'bg-purple-100 text-purple-700 border-purple-200',
};

const AdminComplaints = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    fetchComplaints();
    fetchStaffList();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterCategory) params.append('category', filterCategory);
      if (filterFrom) params.append('from', filterFrom);
      if (filterTo) params.append('to', filterTo);

      const res = await api.get(`/admin/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data.complaints);
        setStatistics(res.data.data.statistics);
        setAnalytics(res.data.data.analytics);
      }
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/admin/staff');
      if (res.data.success) setStaffList(res.data.data);
    } catch {}
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return;
    try {
      setUpdating(true);
      await api.patch(`/admin/complaints/${selectedComplaint.complaintId}`, { status: statusUpdate, adminResponse });
      setShowModal(false);
      setStatusUpdate('');
      setAdminResponse('');
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const submitAssignment = async () => {
    if (!selectedStaff) return;
    try {
      setAssigning(true);
      await api.post(`/admin/complaints/${selectedComplaint.complaintId}/assign`, { staffId: selectedStaff });
      setShowAssignModal(false);
      setSelectedStaff('');
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm('Run auto-escalation for all unresolved complaints older than 3 days?')) return;
    try {
      setEscalating(true);
      const res = await api.post('/admin/escalate-complaints');
      alert(res.data.message);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Escalation failed');
    } finally {
      setEscalating(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader message="Loading complaints..." /></div>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative`}>
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
          {MENU.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white transition-all duration-300">
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg z-20 text-xs">
          {sidebarOpen ? '<' : '>'}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Complaints</h1>
            <p className="text-sm text-gray-500">Search, filter, assign and track all complaints</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleEscalate} disabled={escalating}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors disabled:opacity-50">
              {escalating ? 'Escalating...' : '⚠️ Run Escalation'}
            </button>
            <button onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-200 transition-colors">
              📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              {sidebarOpen && <span className="text-sm font-semibold text-gray-900 hidden md:block">{user?.username || 'Admin'}</span>}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Analytics Panel */}
          {showAnalytics && statistics && analytics && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Complaint Analytics</h2>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  { label: 'Total', value: statistics.total, color: 'indigo' },
                  { label: 'Pending', value: statistics.pending, color: 'yellow' },
                  { label: 'In Progress', value: statistics.inProgress, color: 'blue' },
                  { label: 'Resolved', value: statistics.resolved, color: 'green' },
                  { label: 'Rejected', value: statistics.rejected, color: 'red' },
                  { label: 'Escalated', value: statistics.escalated, color: 'purple' },
                ].map(s => (
                  <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-200 rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</p>
                    <p className={`text-xs text-${s.color}-600 font-medium`}>{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Resolution rate */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="bg-green-50 rounded-xl p-4 flex-1 min-w-[160px]">
                  <p className="text-sm text-gray-500 mb-1">30-day Resolution Rate</p>
                  <p className="text-3xl font-bold text-green-700">{analytics.resolutionRate}%</p>
                  <p className="text-xs text-gray-400">{analytics.recentResolved}/{analytics.recentTotal} resolved</p>
                </div>
                {/* By category */}
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-semibold text-gray-700 mb-2">By Category</p>
                  <div className="space-y-1">
                    {analytics.byCategory.slice(0, 5).map(c => (
                      <div key={c._id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-28 truncate">{c._id}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (c.count / (statistics.total || 1)) * 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-6 text-right">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* By priority */}
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-semibold text-gray-700 mb-2">By Priority</p>
                  <div className="space-y-1">
                    {analytics.byPriority.map(p => (
                      <div key={p._id} className="flex items-center gap-2">
                        <span className={`text-xs font-semibold capitalize w-16 ${p._id === 'high' ? 'text-red-600' : p._id === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{p._id}</span>
                        <span className="text-xs text-gray-700 font-bold">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Search</label>
                <input type="text" placeholder="Name, roll no, complaint ID, title..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="">All Status</option>
                  {['Pending','In Progress','Resolved','Rejected','Escalated'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Priority</label>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="">All Priority</option>
                  {['low','medium','high'].map(p => <option key={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  <option value="">All Categories</option>
                  {['Infrastructure','Academics','Hostel','Library','Canteen','Transport','IT Services','Sports','Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">From</label>
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">To</label>
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <button onClick={fetchComplaints}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Apply
              </button>
              <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterCategory(''); setFilterFrom(''); setFilterTo(''); setTimeout(fetchComplaints, 0); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Clear
              </button>
            </div>
          </div>

          {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-4 text-red-700 text-sm">{error}</div>}

          {/* Complaints count */}
          <p className="text-sm text-gray-500 mb-3">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</p>

          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <div className="text-5xl mb-3">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">No complaints found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {complaints.map(complaint => (
                <div key={complaint._id} className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold text-gray-400">{complaint.complaintId}</span>
                        {complaint.isEscalated && complaint.status !== 'Resolved' && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">⚠️ Escalated</span>}
                      </div>
                      <h3 className="font-bold text-gray-900">{complaint.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ml-2 flex-shrink-0 ${STATUS_COLORS[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
                      {complaint.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 mb-3 text-sm">
                    <span className="font-medium text-gray-900">{complaint.studentName}</span>
                    <span className="text-gray-400 mx-1">·</span>
                    <span className="text-gray-500 text-xs">{complaint.studentRollNumber} · {complaint.studentDepartment}</span>
                  </div>

                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{complaint.category}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${complaint.priority === 'high' ? 'bg-red-100 text-red-700' : complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {complaint.priority} priority
                    </span>
                    {complaint.feedback?.rating && (
                      <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium">
                        {'⭐'.repeat(complaint.feedback.rating)} Feedback
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{complaint.description}</p>

                  {complaint.assignedToName && (
                    <div className="bg-indigo-50 rounded-lg px-3 py-1.5 mb-3 text-xs text-indigo-700">
                      Assigned to: <span className="font-semibold">{complaint.assignedToName}</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 mb-3">{formatDate(complaint.createdAt)}</div>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setSelectedComplaint(complaint); setShowModal(true); setStatusUpdate(''); setAdminResponse(''); }}
                      className="flex-1 bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors">
                      View & Update
                    </button>
                    {!complaint.assignedToName && (
                      <button onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true); setSelectedStaff(''); }}
                        className="flex-1 bg-green-100 text-green-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                        Assign
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                      📋 History
                    </button>
                  </div>

                  {/* History Timeline */}
                  {expandedId === complaint._id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Status History</p>
                      {complaint.statusHistory?.length > 0 ? (
                        <div className="space-y-2">
                          {complaint.statusHistory.map((h, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{h.status} <span className="text-gray-400 font-normal">by {h.changedByName || 'System'}</span></p>
                                {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                                <p className="text-xs text-gray-400">{formatDate(h.timestamp)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-gray-400">No history yet</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* View & Update Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Complaint Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400">{selectedComplaint.complaintId}</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${STATUS_COLORS[selectedComplaint.status] || ''}`}>{selectedComplaint.status}</span>
                {selectedComplaint.isEscalated && selectedComplaint.status !== 'Resolved' && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">⚠️ Escalated</span>}
              </div>
              <h4 className="font-bold text-gray-900">{selectedComplaint.title}</h4>
              <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400 text-xs">Student</span><p className="font-medium">{selectedComplaint.studentName}</p></div>
                <div><span className="text-gray-400 text-xs">Roll No</span><p className="font-medium">{selectedComplaint.studentRollNumber}</p></div>
                <div><span className="text-gray-400 text-xs">Category</span><p className="font-medium">{selectedComplaint.category}</p></div>
                <div><span className="text-gray-400 text-xs">Priority</span><p className="font-medium capitalize">{selectedComplaint.priority}</p></div>
              </div>
              {selectedComplaint.feedback?.rating && (
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Student Feedback</p>
                  <p className="text-sm">{'⭐'.repeat(selectedComplaint.feedback.rating)} ({selectedComplaint.feedback.rating}/5)</p>
                  {selectedComplaint.feedback.comment && <p className="text-xs text-gray-600 mt-1">{selectedComplaint.feedback.comment}</p>}
                </div>
              )}
              <div className="border-t pt-3">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Update Status</label>
                <select value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white mb-2">
                  <option value="">Select status...</option>
                  {['Pending','In Progress','Resolved','Rejected','Escalated'].map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea value={adminResponse} onChange={e => setAdminResponse(e.target.value)}
                  placeholder="Admin response / remarks (optional)" rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Close</button>
              <button onClick={handleStatusUpdate} disabled={updating || !statusUpdate}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-lg transition-all">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Assign Complaint</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedComplaint.title}</p>
            <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white mb-4">
              <option value="">Choose staff member...</option>
              {staffList.map(s => <option key={s._id} value={s._id}>{s.name} — {s.department}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={submitAssignment} disabled={assigning || !selectedStaff}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-lg transition-all">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
