import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import resultService from '../services/resultService';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import parseApiError from '../utils/parseApiError';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
    fetchResultsData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardService.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      setError(parseApiError(err, 'Failed to load dashboard data'));
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsData = async () => {
    try {
      const response = await resultService.getMyResults();
      if (response.success) {
        setResultsData(response.data);
      }
    } catch (err) {
      console.error('Results fetch error:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <Loader message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  const { studentInfo, complaintStats, recentComplaint, utAnalytics } = dashboardData;

  // Extract latest UT data for the BarChart from RAW flat array
  let chartData = [];
  let latestSemesterData = null; // Removed complex logic fallback
  if (resultsData && Array.isArray(resultsData) && resultsData.length > 0) {
    chartData = resultsData.slice(0, 6).map(b => ({
      name: b.subjectCode || b.subjectName?.substring(0, 10),
      marks: b.marksObtained || 0,
      maxMarks: b.maxMarks || 100
    }));
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      key: 'dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Raise Complaint', 
      path: '/complaints/new', 
      key: 'raise',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      name: 'My Complaints', 
      path: '/complaints', 
      key: 'complaints',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'UT Results', 
      path: '/results', 
      key: 'results',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Student Corner', 
      path: '/corner', 
      key: 'corner',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      )
    },
    { 
      name: 'AI Assistant', 
      path: '/ai-chat', 
      key: 'ai',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        menuItems={menuItems}
        logoLabel="CampusOne"
        gradientClass="bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900"
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {studentInfo.name} 👋</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                {studentInfo.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{studentInfo.rollNumber}</p>
                <p className="text-xs text-indigo-600 font-medium">{studentInfo.department}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-8 mb-8 text-white animate-scale-in relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-20 w-40 h-40 bg-purple-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-3xl font-bold mb-3">Welcome back, {studentInfo.name}! 👋</h2>
                <p className="text-indigo-100 flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    {studentInfo.rollNumber}
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {studentInfo.department}
                  </span>
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Year {Math.ceil(studentInfo.semester / 2) || studentInfo.year || 1} &bull; Sem {studentInfo.semester}
                  </span>
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl animate-float">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Complaints */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500 shine-effect group animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Complaints</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">{complaintStats.total}</p>
              <div className="flex items-center text-xs text-indigo-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                All time
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-yellow-500 shine-effect group animate-scale-in" style={{animationDelay: '100ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Pending</h3>
              <p className="text-4xl font-bold text-yellow-600 mb-2">{complaintStats.byStatus.pending}</p>
              <div className="flex items-center text-xs text-yellow-600 font-medium">
                <svg className="w-4 h-4 mr-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Needs attention
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500 shine-effect group animate-scale-in" style={{animationDelay: '200ms'}}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Resolved</h3>
              <p className="text-4xl font-bold text-green-600 mb-2">{complaintStats.byStatus.resolved}</p>
              <div className="flex items-center text-xs text-green-600 font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            </div>
          </div>

          {/* Analytics Charts Section - Only show if data is available */}
          {(complaintStats.total > 0 || utAnalytics || chartData.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all duration-500">
              {/* Complaint Status Pie Chart - Only show if complaints exist */}
              {complaintStats.total > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Complaint Status Overview</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: complaintStats.byStatus.pending, color: '#EAB308' },
                          { name: 'In Progress', value: complaintStats.byStatus.inProgress, color: '#3B82F6' },
                          { name: 'Resolved', value: complaintStats.byStatus.resolved, color: '#10B981' }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Pending', value: complaintStats.byStatus.pending, color: '#EAB308' },
                          { name: 'In Progress', value: complaintStats.byStatus.inProgress, color: '#3B82F6' },
                          { name: 'Resolved', value: complaintStats.byStatus.resolved, color: '#10B981' }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* UT Performance Bar Chart - Only show if results exist */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Latest UT Performance{resultsData?.length > 0 ? ` (Sem ${resultsData[0].semester})` : ''}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="marks" fill="url(#colorGradient)" name="Marks Obtained" />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* UT Analytics Cards - Show if analytics data exists */}
          {utAnalytics && (utAnalytics.ut1 || utAnalytics.ut2) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">UT Performance Analytics</h2>
              
              {/* Comparison Banner */}
              {utAnalytics.comparison && (
                <div className={`rounded-2xl p-6 mb-6 ${
                  utAnalytics.comparison.status === 'Improved' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : utAnalytics.comparison.status === 'Declined'
                    ? 'bg-gradient-to-r from-red-500 to-pink-600'
                    : 'bg-gradient-to-r from-gray-500 to-slate-600'
                } text-white shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">UT1 vs UT2 Comparison</h3>
                      <p className="text-lg">{utAnalytics.comparison.message}</p>
                    </div>
                    <div className="text-5xl">
                      {utAnalytics.comparison.status === 'Improved' ? '📈' : 
                       utAnalytics.comparison.status === 'Declined' ? '📉' : '➡️'}
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* UT1 Analytics */}
                {utAnalytics.ut1 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <span>UT-1 Analytics</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        utAnalytics.ut1.performanceIndicator === 'Excellent' ? 'bg-green-100 text-green-700' :
                        utAnalytics.ut1.performanceIndicator === 'Good' ? 'bg-blue-100 text-blue-700' :
                        utAnalytics.ut1.performanceIndicator === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {utAnalytics.ut1.performanceIndicator}
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Total Subjects</span>
                        <span className="text-xl font-bold text-gray-900">{utAnalytics.ut1.totalSubjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Overall Percentage</span>
                        <span className="text-xl font-bold text-indigo-600">{utAnalytics.ut1.overallPercentage}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Average Percentage</span>
                        <span className="text-xl font-bold text-gray-900">{utAnalytics.ut1.averagePercentage}%</span>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏆</span>
                          <span className="text-sm font-semibold text-green-700">Highest Score</span>
                        </div>
                        <p className="text-gray-900 font-bold">{utAnalytics.ut1.highestSubject.name}</p>
                        <p className="text-sm text-gray-600">
                          {utAnalytics.ut1.highestSubject.marks}/{utAnalytics.ut1.highestSubject.maxMarks} 
                          ({utAnalytics.ut1.highestSubject.percentage}%)
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📌</span>
                          <span className="text-sm font-semibold text-red-700">Needs Focus</span>
                        </div>
                        <p className="text-gray-900 font-bold">{utAnalytics.ut1.lowestSubject.name}</p>
                        <p className="text-sm text-gray-600">
                          {utAnalytics.ut1.lowestSubject.marks}/{utAnalytics.ut1.lowestSubject.maxMarks} 
                          ({utAnalytics.ut1.lowestSubject.percentage}%)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* UT2 Analytics */}
                {utAnalytics.ut2 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                      <span>UT-2 Analytics</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        utAnalytics.ut2.performanceIndicator === 'Excellent' ? 'bg-green-100 text-green-700' :
                        utAnalytics.ut2.performanceIndicator === 'Good' ? 'bg-blue-100 text-blue-700' :
                        utAnalytics.ut2.performanceIndicator === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {utAnalytics.ut2.performanceIndicator}
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Total Subjects</span>
                        <span className="text-xl font-bold text-gray-900">{utAnalytics.ut2.totalSubjects}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Overall Percentage</span>
                        <span className="text-xl font-bold text-purple-600">{utAnalytics.ut2.overallPercentage}%</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Average Percentage</span>
                        <span className="text-xl font-bold text-gray-900">{utAnalytics.ut2.averagePercentage}%</span>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏆</span>
                          <span className="text-sm font-semibold text-green-700">Highest Score</span>
                        </div>
                        <p className="text-gray-900 font-bold">{utAnalytics.ut2.highestSubject.name}</p>
                        <p className="text-sm text-gray-600">
                          {utAnalytics.ut2.highestSubject.marks}/{utAnalytics.ut2.highestSubject.maxMarks} 
                          ({utAnalytics.ut2.highestSubject.percentage}%)
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📌</span>
                          <span className="text-sm font-semibold text-red-700">Needs Focus</span>
                        </div>
                        <p className="text-gray-900 font-bold">{utAnalytics.ut2.lowestSubject.name}</p>
                        <p className="text-sm text-gray-600">
                          {utAnalytics.ut2.lowestSubject.marks}/{utAnalytics.ut2.lowestSubject.maxMarks} 
                          ({utAnalytics.ut2.lowestSubject.percentage}%)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Analytics Message */}
          {!utAnalytics && chartData.length === 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">Analytics Coming Soon</h3>
                  <p className="text-blue-700">Analytics will appear once UT results are published by your department.</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Recent Activity
            </h2>
            {recentComplaint ? (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{recentComplaint.complaintId}</h3>
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-md">
                      {recentComplaint.category}
                    </span>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(recentComplaint.status)}`}>
                    {recentComplaint.status}
                  </span>
                </div>
                <div className="border-t border-indigo-200 pt-4 mt-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Created: {formatDate(recentComplaint.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated: {formatDate(recentComplaint.updatedAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage('complaints');
                    navigate('/complaints');
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-2xl"
                >
                  View All Complaints →
                </button>
              </div>
            ) : (
              <div className="text-center py-16 animate-bounce-in">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No complaints yet 📋</h3>
                <p className="text-gray-500 mb-6">Click "Raise Complaint" from the sidebar to get started</p>
                <button
                  onClick={() => {
                    setCurrentPage('raise');
                    navigate('/complaints/new');
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Raise Complaint
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
