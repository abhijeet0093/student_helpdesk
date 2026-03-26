import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const StorageStats = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/storage-stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load storage stats');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard',      path: '/admin/dashboard' },
    { name: 'Students',       path: '/admin/students' },
    { name: 'Complaints',     path: '/admin/complaints' },
    { name: 'UT Results',     path: '/admin/results' },
    { name: 'Staff',          path: '/admin/staff' },
    { name: 'Storage Stats',  path: '/admin/storage-stats' },
  ];

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
      <div className="flex-1 flex items-center justify-center"><Loader message="Loading storage stats..." /></div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchStats} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold">Retry</button>
        </div>
      </div>
    </div>
  );

  const cards = [
    { label: 'Total Students',    value: stats.users,         color: 'border-indigo-500', icon: '👨‍🎓' },
    { label: 'Total Complaints',  value: stats.complaints,    color: 'border-yellow-500', icon: '📋' },
    { label: 'Student Posts',     value: stats.posts,         color: 'border-purple-500', icon: '📝' },
    { label: 'AI Chat Messages',  value: stats.chatMessages,  color: 'border-blue-500',   icon: '💬' },
    { label: 'Notifications',     value: stats.notifications, color: 'border-pink-500',   icon: '🔔' },
    { label: 'UT Results',        value: stats.results,       color: 'border-green-500',  icon: '📊' },
  ];

  const ATLAS_LIMIT_MB = 512;
  const dbUsagePct = stats.databaseSizeMB > 0 ? (stats.databaseSizeMB / ATLAS_LIMIT_MB) * 100 : 0;
  const dbStatus = dbUsagePct >= 80 ? 'red' : dbUsagePct >= 60 ? 'yellow' : 'green';
  const dbStatusStyle = {
    red:    { bar: 'bg-red-500',    text: 'text-red-600',    label: '⚠️ Near Limit',  bg: 'bg-red-50 border-red-200' },
    yellow: { bar: 'bg-yellow-400', text: 'text-yellow-600', label: '⚡ Moderate',    bg: 'bg-yellow-50 border-yellow-200' },
    green:  { bar: 'bg-green-500',  text: 'text-green-600',  label: '✅ Safe',         bg: 'bg-green-50 border-green-200' },
  }[dbStatus];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Storage Stats</h1>
            <p className="text-sm text-gray-600">System storage and data overview</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            {<div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
              <p className="text-xs text-indigo-600">Administrator</p>
            </div>}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* DB Record Counts */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Database Records</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cards.map(card => (
                <div key={card.label} className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${card.color} hover:shadow-xl transition-all duration-300`}>
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DB Size + Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Size */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-teal-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗄️</span>
                  <h3 className="text-lg font-bold text-gray-800">Database Size</h3>
                </div>
                {stats.databaseSizeMB > 0 && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${dbStatusStyle.bg} ${dbStatusStyle.text}`}>
                    {dbStatusStyle.label}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Data Size</span>
                  <span className={`font-bold ${dbStatusStyle.text}`}>
                    {stats.databaseSizeMB > 0 ? `${stats.databaseSizeMB} MB` : 'See Atlas Dashboard'}
                  </span>
                </div>
                {stats.databaseSizeMB > 0 && (
                  <div className="px-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{stats.databaseSizeMB} MB used</span>
                      <span>{ATLAS_LIMIT_MB} MB limit</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full transition-all duration-500 ${dbStatusStyle.bar}`}
                        style={{ width: `${Math.min(dbUsagePct, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{dbUsagePct.toFixed(1)}% used</p>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Storage Size</span>
                  <span className="font-bold text-teal-600">
                    {stats.storageSizeMB > 0 ? `${stats.storageSizeMB} MB` : 'See Atlas Dashboard'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-sm text-gray-600">Atlas Free Tier Limit</span>
                  <span className="font-bold text-teal-700">512 MB</span>
                </div>
              </div>
            </div>

            {/* Uploads Folder */}
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📁</span>
                <h3 className="text-lg font-bold text-gray-800">Uploads Folder</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Total Files</span>
                  <span className="font-bold text-orange-600">{stats.uploads.totalFiles.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Total Size</span>
                  <span className="font-bold text-orange-600">{stats.uploads.totalSizeMB} MB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <span className="text-sm text-gray-600">Storage Type</span>
                  <span className="font-bold text-orange-700">Local Server</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retention Policy Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Data Retention Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'UT Results',   duration: 'Forever',  color: 'bg-green-50 border-green-200 text-green-700' },
                { label: 'Complaints',   duration: 'Forever',  color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { label: 'AI Chat',      duration: '30 days',  color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { label: 'Posts',        duration: '1 year',   color: 'bg-purple-50 border-purple-200 text-purple-700' },
              ].map(item => (
                <div key={item.label} className={`p-4 rounded-xl border ${item.color}`}>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-lg font-bold mt-1">{item.duration}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-right">
            <button onClick={fetchStats} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm">
              Refresh Stats
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default StorageStats;
