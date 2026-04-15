import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const menuItems = [
  { name: 'Dashboard',     path: '/admin/dashboard' },
  { name: 'Students',      path: '/admin/students' },
  { name: 'Complaints',    path: '/admin/complaints' },
  { name: 'UT Results',    path: '/admin/results' },
  { name: 'Staff',         path: '/admin/staff' },
  { name: 'Storage Stats', path: '/admin/storage-stats' },
  { name: 'Backup Status', path: '/admin/backup-status' },
];

function timeAgo(dateStr) {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const STATUS_STYLE = {
  SUCCESS: { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  icon: '✅', label: 'Success' },
  PARTIAL: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', icon: '⚠️', label: 'Partial' },
  FAILED:  { bg: 'bg-red-50 border-red-200',       text: 'text-red-700',    badge: 'bg-red-100 text-red-700',       icon: '❌', label: 'Failed' },
};

const BackupStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true); setError('');
      const res = await api.get('/admin/backup-status');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load backup status');
    } finally {
      setLoading(false);
    }
  };

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 opacity-50" />
      <div className="p-6 border-b border-slate-700/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Admin Panel</span>}
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-105'}`}>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700/50 relative z-10">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300">
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
        <svg className={`w-4 h-4 transform transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );

  if (loading) return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader message="Loading backup status..." /></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Backup Status</h1>
            <p className="text-sm text-gray-600">Monitor automated backup health</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchStatus}
              className="p-2.5 text-gray-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-indigo-600">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {/* 24-hour warning */}
          {data?.warning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium text-yellow-800">
                {data.lastBackup ? 'Backup not run in the last 24 hours. Please check the scheduler.' : 'No backup records found. Run a backup to get started.'}
              </p>
            </div>
          )}

          {/* Last Backup Card */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Last Backup</h2>
            {data?.lastBackup ? (() => {
              const s = STATUS_STYLE[data.lastBackup.status] || STATUS_STYLE.FAILED;
              return (
                <div className={`rounded-2xl border p-6 shadow-md ${s.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{s.icon}</span>
                      <div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.badge}`}>{s.label}</span>
                        <p className={`text-lg font-bold mt-1 ${s.text}`}>
                          {data.lastBackup.status === 'SUCCESS'
                            ? 'Last backup completed successfully'
                            : data.lastBackup.status === 'PARTIAL'
                            ? 'Last backup partially completed'
                            : 'Last backup failed — please check system'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{timeAgo(data.lastBackup.createdAt)}</p>
                      <p className="text-xs text-gray-500">{new Date(data.lastBackup.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <p className={`text-sm ${s.text} bg-white/60 rounded-xl px-4 py-2`}>{data.lastBackup.message}</p>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    {data.lastBackup.dbBackupPath && <span>🗄️ DB: {data.lastBackup.dbBackupPath.split(/[\\/]/).slice(-2).join('/')}</span>}
                    {data.lastBackup.uploadsBackupPath && <span>📁 Uploads: {data.lastBackup.uploadsBackupPath.split(/[\\/]/).slice(-2).join('/')}</span>}
                  </div>
                </div>
              );
            })() : (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p className="font-medium">No backup records found</p>
                <p className="text-sm mt-1">Run a backup to see status here</p>
              </div>
            )}
          </div>

          {/* Recent Backups Table */}
          {data?.recentBackups?.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Backups</h2>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Date & Time</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Message</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBackups.map((log, i) => {
                      const s = STATUS_STYLE[log.status] || STATUS_STYLE.FAILED;
                      return (
                        <tr key={log._id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-gray-700">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.badge}`}>{s.icon} {s.label}</span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{log.message}</td>
                          <td className="px-5 py-3 text-gray-400">{timeAgo(log.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Schedule Info */}
          <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕑</span>
              <div>
                <p className="font-semibold text-gray-800">Backup Schedule</p>
                <p className="text-sm text-gray-500">Runs automatically every day at 2:00 AM IST</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">Active</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BackupStatus;
