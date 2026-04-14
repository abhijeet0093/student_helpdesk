import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_STYLE = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const GRADE_STYLE = {
  Distinction:   'bg-purple-100 text-purple-700',
  'First Class': 'bg-blue-100 text-blue-700',
  'Second Class':'bg-cyan-100 text-cyan-700',
  Pass:          'bg-green-100 text-green-700',
  Fail:          'bg-red-100 text-red-700',
};

const AdminMSBTEResults = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab]               = useState('pending');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [publishSem, setPublishSem] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { fetchResults(); }, [tab]); // eslint-disable-line

  const fetchResults = async () => {
    try {
      setLoading(true); setMsg(''); setExpandedRow(null);
      const url = tab === 'pending'
        ? '/admin/msbte-results/pending'
        : `/admin/msbte-results?status=${tab}`;
      const res = await api.get(url);
      if (res.data.success) setResults(res.data.data);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await api.post(`/admin/msbte-results/${id}/approve`);
      setMsg('✅ Result approved — now visible to student');
      fetchResults();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to approve');
    }
  };

  const reject = async () => {
    try {
      await api.post(`/admin/msbte-results/${rejectModal}/reject`, { reason: rejectReason });
      setMsg('Result rejected — staff can resubmit');
      setRejectModal(null); setRejectReason('');
      fetchResults();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to reject');
    }
  };

  const bulkPublish = async () => {
    if (!window.confirm(`Publish ALL pending MSBTE results${publishSem ? ` for Semester ${publishSem}` : ''}?`)) return;
    try {
      setPublishing(true);
      const res = await api.post('/admin/publish-msbte-results', publishSem ? { semester: parseInt(publishSem) } : {});
      setMsg(res.data.message);
      fetchResults();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MSBTE Results Management</h1>
            <p className="text-sm text-gray-500">Review and approve staff-submitted semester results</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all">
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {msg && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${
            msg.includes('approved') || msg.includes('Published')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : msg.includes('rejected')
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {msg}
          </div>
        )}

        {/* Bulk Publish */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-gray-900">Bulk Publish MSBTE Results</p>
            <p className="text-sm text-gray-500">Approve all pending results at once (optionally filter by semester)</p>
          </div>
          <select value={publishSem} onChange={e => setPublishSem(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400">
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <button onClick={bulkPublish} disabled={publishing}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            {publishing ? 'Publishing...' : '🚀 Publish All Pending'}
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-1.5 flex gap-1 mb-6">
          {['pending', 'approved', 'rejected'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all duration-300 ${
                tab === t
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {t === 'pending' ? '⏳' : t === 'approved' ? '✅' : '❌'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-bold text-gray-900">No {tab} results</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(r => (
              <div key={r._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                      S{r.semester}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{r.rollNo}</p>
                      <p className="text-sm text-gray-500">Semester {r.semester} • {r.subjects?.length || 0} subjects • {r.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">{r.finalPercentage?.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">Final %</p>
                    </div>
                    {r.grade && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${GRADE_STYLE[r.grade] || 'bg-gray-100 text-gray-600'}`}>
                        {r.grade}
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                    {tab === 'pending' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => approve(r._id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors">
                          ✅ Approve
                        </button>
                        <button onClick={() => { setRejectModal(r._id); setRejectReason(''); }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === r._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded subject breakdown */}
                {expandedRow === r._id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Subject-wise Marks</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      {r.subjects?.map(s => (
                        <div key={s.code} className="flex flex-col bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">{s.totalMarks ?? s.marks}</p>
                              <p className="text-xs text-gray-400">/ {s.totalMax ?? 100}</p>
                            </div>
                          </div>
                          {(s.theoryMarks != null || s.practicalMarks != null) && (
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {s.theoryMarks != null && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  Theory: {s.theoryMarks}/{s.theoryMax}
                                </span>
                              )}
                              {s.practicalMarks != null && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                  Practical: {s.practicalMarks}/{s.practicalMax}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl px-5 py-3 text-white">
                      <span className="font-semibold text-sm">Final Semester Percentage</span>
                      <span className="text-2xl font-bold">{r.finalPercentage?.toFixed(2)}%</span>
                    </div>
                    {r.rejectedReason && (
                      <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                        Rejection reason: {r.rejectedReason}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Submitted: {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Result</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..." rows={3}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={reject}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMSBTEResults;
