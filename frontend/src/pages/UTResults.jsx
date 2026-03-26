import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resultService from '../services/resultService';
import Loader from '../components/Loader';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Raise Complaint', path: '/complaints/new' },
  { name: 'My Complaints', path: '/complaints' },
  { name: 'UT Results', path: '/results' },
  { name: 'Student Corner', path: '/corner' },
  { name: 'AI Assistant', path: '/ai-chat' },
];

const getMenuIcon = (name) => {
  if (name === 'Dashboard') return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  if (name === 'Raise Complaint') return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
  if (name === 'My Complaints') return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
  if (name === 'UT Results') return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  if (name === 'Student Corner') return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>;
  return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
};

const UTResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { if (user?.semester) setSelectedSemester(user.semester); }, [user]);
  useEffect(() => { fetchResults(selectedSemester); }, [selectedSemester]);

  const fetchResults = async (semester) => {
    try {
      setLoading(true); setError('');
      const response = await resultService.getMyResults(semester);
      if (response.success) setResultsData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeLabel = (pct) => {
    if (pct >= 75) return 'Excellent';
    if (pct >= 60) return 'Good';
    if (pct >= 50) return 'Average';
    return 'Needs Improvement';
  };

  const getAvailableSemesters = () => {
    const year = user?.year || 1;
    const base = (year - 1) * 2;
    return [base + 1, base + 2];
  };

  const Sidebar = () => (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"></div>
      <div className="p-6 border-b border-indigo-500/30 relative z-10">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right group ${isActive ? 'bg-white text-indigo-600 shadow-lg scale-105' : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105'}`}>
              <span className="group-hover:scale-110 transition-transform duration-300">{getMenuIcon(item.name)}</span>
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
  );

  if (loading) return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center"><Loader message="Loading results..." /></div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchResults} className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">Retry</button>
        </div>
      </div>
    </div>
  );

  if (!resultsData || resultsData.results.length === 0) return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">UT Results</h1>
          <p className="text-sm text-gray-600">{user?.fullName} • {user?.rollNumber}</p>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center max-w-md w-full animate-scale-in">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h2>
            <p className="text-gray-600">Your UT results for Semester {user?.semester || 1} have not been published yet.</p>
          </div>
        </main>
      </div>
    </div>
  );

  const { results, summary, analysis, currentSemester } = resultsData;
  const semesters = getAvailableSemesters();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">UT Results</h1>
            <p className="text-sm text-gray-600">{user?.fullName} • {user?.rollNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            {analysis && (
              <button onClick={() => navigate('/results/analysis')}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Analysis
              </button>
            )}
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
          {/* Semester Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Year {user?.year || 1} Results</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Current Semester: {user?.semester || 1}</span>
            </div>
            <div className="flex gap-3">
              {semesters.map(sem => (
                <button key={sem} onClick={() => setSelectedSemester(sem)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedSemester === sem ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 shine-effect">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">UT-1 Summary</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-indigo-100">Total Marks</span><span className="text-2xl font-bold">{summary.ut1.totalMarks}/{summary.ut1.maxMarks}</span></div>
                  <div className="flex justify-between"><span className="text-indigo-100">Percentage</span><span className="text-3xl font-bold">{summary.ut1.percentage}%</span></div>
                  <div className="flex justify-between"><span className="text-indigo-100">Subjects</span><span className="text-xl font-semibold">{summary.ut1.subjectsCount}</span></div>
                  <div className="pt-3 border-t border-white/20"><span className="text-sm text-indigo-100">{getGradeLabel(parseFloat(summary.ut1.percentage))}</span></div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 shine-effect">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">UT-2 Summary</h3>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-purple-100">Total Marks</span><span className="text-2xl font-bold">{summary.ut2.totalMarks}/{summary.ut2.maxMarks}</span></div>
                  <div className="flex justify-between"><span className="text-purple-100">Percentage</span><span className="text-3xl font-bold">{summary.ut2.percentage}%</span></div>
                  <div className="flex justify-between"><span className="text-purple-100">Subjects</span><span className="text-xl font-semibold">{summary.ut2.subjectsCount}</span></div>
                  <div className="pt-3 border-t border-white/20"><span className="text-sm text-purple-100">{getGradeLabel(parseFloat(summary.ut2.percentage))}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Semester {currentSemester || user?.semester} Results
              </h2>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-sm">{results.length} Subject{results.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-3">
              {results.map((subject, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-xl p-4 hover:bg-indigo-50/50 transition-all duration-200 hover:shadow-md">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">{subject.subjectName}</h3>
                    <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {subject.ut1 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">UT-1</p>
                        <p className="text-lg font-bold text-gray-900">{subject.ut1.marksObtained}/{subject.ut1.maxMarks}</p>
                      </div>
                    )}
                    {subject.ut2 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">UT-2</p>
                        <p className="text-lg font-bold text-gray-900">{subject.ut2.marksObtained}/{subject.ut2.maxMarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {summary && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-gray-900">Overall Performance</h3>
                  <span className="text-2xl font-bold text-indigo-600">{summary.ut2?.percentage || summary.ut1?.percentage || '0'}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${summary.ut2?.percentage || summary.ut1?.percentage || 0}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Analysis */}
          {analysis && (
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Quick Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-5 border-l-4 border-green-500 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2"><span className="text-2xl">📈</span><h4 className="font-bold text-gray-900">Improved</h4></div>
                  <p className="text-3xl font-bold text-green-600">{analysis.improved.length}</p>
                  <p className="text-sm text-gray-500">subject(s)</p>
                </div>
                <div className="bg-red-50 rounded-xl p-5 border-l-4 border-red-500 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2"><span className="text-2xl">📉</span><h4 className="font-bold text-gray-900">Need Attention</h4></div>
                  <p className="text-3xl font-bold text-red-600">{analysis.declined.length}</p>
                  <p className="text-sm text-gray-500">subject(s)</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💪</span><h4 className="font-bold text-gray-900">Strong Subjects</h4></div>
                  <p className="text-3xl font-bold text-blue-600">{analysis.strongSubjects.length}</p>
                  <p className="text-sm text-gray-500">subject(s)</p>
                </div>
              </div>
              <button onClick={() => navigate('/results/analysis')}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                View Detailed Analysis →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UTResults;
