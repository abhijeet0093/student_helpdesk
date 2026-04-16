import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resultService from '../services/resultService';
import Loader from '../components/Loader';

// ── Exact subject mapping (mirrors backend msbteSubjectsConfig.js) ────────────
const MSBTE_SUBJECTS = {
  1: { compulsory: [
    { code: '311302', name: 'Basic Mathematics' },
    { code: '311303', name: 'Communication Skills (English)' },
    { code: '311305', name: 'Basic Science' },
    { code: '311001', name: 'Fundamentals of ICT' },
    { code: '311002', name: 'Engineering Workshop Practice' },
    { code: '311003', name: 'Yoga and Meditation' },
    { code: '311008', name: 'Engineering Graphics' },
  ], electives: [] },
  2: { compulsory: [
    { code: '312301', name: 'Applied Mathematics' },
    { code: '312302', name: 'Basic Electrical and Electronics Engineering' },
    { code: '312303', name: 'Programming in C' },
    { code: '312001', name: 'Linux Basics' },
    { code: '312002', name: 'Professional Communication' },
    { code: '312003', name: 'Social and Life Skills' },
    { code: '312004', name: 'Web Page Designing' },
  ], electives: [] },
  3: { compulsory: [
    { code: '313301', name: 'Data Structure Using C' },
    { code: '313302', name: 'Database Management System' },
    { code: '313303', name: 'Digital Techniques' },
    { code: '313304', name: 'Object Oriented Programming Using C++' },
    { code: '313001', name: 'Computer Graphics' },
    { code: '313002', name: 'Essence of Indian Constitution' },
  ], electives: [] },
  4: { compulsory: [
    { code: '314317', name: 'Java Programming' },
    { code: '314318', name: 'Data Communication and Computer Network' },
    { code: '314321', name: 'Microprocessor Programming' },
    { code: '314301', name: 'Environmental Education and Sustainability' },
    { code: '314004', name: 'Python Programming' },
    { code: '314005', name: 'UI/UX Design' },
  ], electives: [] },
  5: {
    compulsory: [
      { code: '315319', name: 'Operating System' },
      { code: '315323', name: 'Software Engineering' },
      { code: '315002', name: 'Entrepreneurship Development and Startups' },
      { code: '315003', name: 'Seminar and Project Initiation' },
      { code: '315004', name: 'Internship' },
    ],
    electives: [
      { code: '315321', name: 'Advance Computer Network' },
      { code: '315325', name: 'Cloud Computing' },
      { code: '315326', name: 'Data Analytics' },
    ],
    electiveLabel: 'Elective I',
  },
  6: {
    compulsory: [
      { code: '315301', name: 'Management' },
      { code: '316314', name: 'Software Testing' },
      { code: '316313', name: 'Emerging Trends in Computer Engineering & IT' },
      { code: '316005', name: 'Client Side Scripting' },
      { code: '316006', name: 'Mobile Application Development' },
      { code: '316004', name: 'Capstone Project' },
    ],
    electives: [
      { code: '316315', name: 'Digital Forensic and Hacking Techniques' },
      { code: '316316', name: 'Machine Learning' },
      { code: '316317', name: 'Network and Information Security' },
    ],
    electiveLabel: 'Elective II',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const gradeLabel = (marks) => {
  if (marks >= 75) return { label: 'Distinction', cls: 'text-purple-700 bg-purple-100' };
  if (marks >= 60) return { label: 'First Class', cls: 'text-blue-700 bg-blue-100' };
  if (marks >= 45) return { label: 'Second Class', cls: 'text-cyan-700 bg-cyan-100' };
  if (marks >= 35) return { label: 'Pass',         cls: 'text-green-700 bg-green-100' };
  return               { label: 'Fail',            cls: 'text-red-700 bg-red-100' };
};

const barColor = (pct) => {
  if (pct >= 75) return 'from-purple-500 to-indigo-600';
  if (pct >= 60) return 'from-blue-500 to-cyan-500';
  if (pct >= 45) return 'from-cyan-500 to-teal-500';
  if (pct >= 35) return 'from-green-500 to-emerald-500';
  return 'from-red-500 to-rose-500';
};

const menuItems = [
  { name: 'Dashboard',       path: '/dashboard' },
  { name: 'Raise Complaint', path: '/complaints/new' },
  { name: 'My Complaints',   path: '/complaints' },
  { name: 'UT Results',      path: '/results' },
  { name: 'MSBTE Results',   path: '/msbte-results' },
  { name: 'Student Corner',  path: '/corner' },
  { name: 'AI Assistant',    path: '/ai-chat' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const MSBTEResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [results, setResults]         = useState([]);   // approved semester docs
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeSem, setActiveSem]     = useState(null);

  useEffect(() => { fetchResults(); }, []); // eslint-disable-line

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await resultService.getMyMSBTEResults();
      if (res.success) {
        setResults(res.data);
        if (res.data.length > 0) setActiveSem(res.data[0].semester);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load MSBTE results');
    } finally {
      setLoading(false);
    }
  };

  // Active semester data
  const semData = results.find(r => r.semester === activeSem);

  // Build display rows: compulsory from config + the chosen elective from DB
  const semConfig   = semData ? (MSBTE_SUBJECTS[semData.semester] || { compulsory: [], electives: [] }) : null;

  const compulsoryRows = semConfig
    ? semConfig.compulsory.map(def => {
        const found = semData.subjects.find(s => s.code === def.code);
        return {
          ...def,
          isElective:     false,
          marks:          found?.marks          ?? null,
          theoryMarks:    found?.theoryMarks     ?? null,
          practicalMarks: found?.practicalMarks  ?? null,
          totalMarks:     found?.totalMarks      ?? null,
          theoryMax:      found?.theoryMax       ?? null,
          practicalMax:   found?.practicalMax    ?? null,
          totalMax:       found?.totalMax        ?? null,
        };
      })
    : [];

  const electiveRow = semData?.elective
    ? (() => {
        const found = semData.subjects.find(s => s.code === semData.elective.code);
        return found
          ? {
              code:           found.code,
              name:           found.name,
              isElective:     true,
              marks:          found.marks          ?? null,
              theoryMarks:    found.theoryMarks     ?? null,
              practicalMarks: found.practicalMarks  ?? null,
              totalMarks:     found.totalMarks      ?? null,
              theoryMax:      found.theoryMax       ?? null,
              practicalMax:   found.practicalMax    ?? null,
              totalMax:       found.totalMax        ?? null,
            }
          : null;
      })()
    : null;

  const allRows = electiveRow ? [...compulsoryRows, electiveRow] : compulsoryRows;

  // Summary stats — use actual totalMax per subject, not a fixed 100
  const enteredRows = allRows.filter(s => (s.totalMarks ?? s.marks) !== null);
  const totalMarks  = enteredRows.reduce((acc, s) => acc + (s.totalMarks ?? s.marks ?? 0), 0);
  const maxMarks    = enteredRows.reduce((acc, s) => acc + (s.totalMax ?? 100), 0);
  const avgPct      = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden flex-shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50" />

        <div className="p-6 border-b border-indigo-500/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">CampusOne</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-lg scale-105'
                    : 'text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105'
                }`}>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-500/30 relative z-10">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-600 hover:text-white transition-all">
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
          <svg className={`w-4 h-4 transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              MSBTE Results
            </h1>
            <p className="text-sm text-gray-600">{user?.fullName} • {user?.rollNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchResults} disabled={loading}
              className="p-2.5 text-gray-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {user?.fullName?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.rollNumber}</p>
                <p className="text-xs text-indigo-600 font-medium">{user?.department}</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader message="Loading MSBTE results..." />
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex justify-between items-center">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button onClick={fetchResults} className="text-sm text-red-600 font-semibold hover:underline">Retry</button>
              </div>
            )}

            {/* No results yet */}
            {!error && results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center max-w-md mx-auto">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No MSBTE Results Yet</h2>
                <p className="text-gray-500 text-sm">
                  Your MSBTE board exam results will appear here once published by admin.
                </p>
              </div>
            )}

            {results.length > 0 && (
              <>
                {/* ── Semester Tabs (same style as UT Results) ── */}
                <div className="bg-white rounded-2xl shadow-lg p-4 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">
                      MSBTE Board Exam Results
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">
                      {results.length} Semester{results.length !== 1 ? 's' : ''} Published
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {results.map(r => (
                      <button key={r.semester} onClick={() => setActiveSem(r.semester)}
                        className={`flex-1 min-w-[100px] py-3 rounded-xl font-semibold transition-all duration-300 ${
                          activeSem === r.semester
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        Semester {r.semester}
                      </button>
                    ))}
                  </div>
                </div>

                {semData && (
                  <>
                    {/* ── Summary Cards (mirrors UT-1 / UT-2 cards) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Final Percentage card */}
                      <div className={`bg-gradient-to-r ${barColor(semData.finalPercentage)} rounded-2xl shadow-xl p-6 text-white`}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-white/70 text-xs uppercase tracking-wide">Semester {semData.semester}</p>
                            <h3 className="text-xl font-bold">Final Percentage</h3>
                          </div>
                          <span className="text-3xl">🎓</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/70 text-sm">Official MSBTE %</span>
                            <span className="text-3xl font-bold">{semData.finalPercentage.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(semData.finalPercentage, 100)}%` }} />
                          </div>
                          <p className="text-white/70 text-xs">{semData.subjects.length} subject(s) entered</p>                        </div>
                      </div>

                      {/* Grade card */}
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-purple-100 text-xs uppercase tracking-wide">Semester {semData.semester}</p>
                            <h3 className="text-xl font-bold">Grade & Performance</h3>
                          </div>
                          <span className="text-3xl">🏆</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-100 text-sm">Grade</span>
                            <span className="text-3xl font-bold">{semData.grade || '—'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-100 text-sm">Subject Average</span>
                            <span className="text-2xl font-bold">{avgPct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(avgPct, 100)}%` }} />
                          </div>
                          <p className="text-purple-100 text-xs">{enteredRows.length} of {allRows.length} subjects entered</p>
                        </div>
                      </div>
                    </div>

                    {/* ── Subject-wise Results (same card style as UT subject rows) ── */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          Semester {semData.semester} — Subject-wise Marks
                        </h2>
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl font-semibold text-sm">
                          {allRows.length} Subject{allRows.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {allRows.map((sub) => {
                          // compute percentage correctly against actual totalMax
                          const subTotal = sub.totalMarks ?? sub.marks;
                          const subMax   = sub.totalMax ?? 100;
                          const subPct   = subTotal !== null && subMax > 0
                            ? (subTotal / subMax) * 100
                            : null;
                          const g = subPct !== null ? gradeLabel(subPct) : null;
                          return (
                            <div key={sub.code}
                              className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                                sub.isElective
                                  ? 'bg-amber-50 hover:bg-amber-100/60 border border-amber-100'
                                  : 'bg-gray-50 hover:bg-purple-50/40'
                              }`}>
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-gray-900 truncate">{sub.name}</h3>
                                    {sub.isElective && semConfig?.electiveLabel && (
                                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                                        {semConfig.electiveLabel}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400">{sub.code}</p>
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0">
                                  {subTotal !== null ? (
                                    <>
                                      {/* Theory */}
                                      {sub.theoryMarks != null && (
                                        <div className="text-center min-w-[80px]">
                                          <p className="text-xs text-blue-600 mb-1 font-semibold">Theory</p>
                                          <p className="text-sm font-bold text-gray-900">
                                            {sub.theoryMarks} / {sub.theoryMax}
                                          </p>
                                        </div>
                                      )}
                                      {/* Practical */}
                                      {sub.practicalMarks != null && (
                                        <div className="text-center min-w-[80px]">
                                          <p className="text-xs text-green-600 mb-1 font-semibold">Practical</p>
                                          <p className="text-sm font-bold text-gray-900">
                                            {sub.practicalMarks} / {sub.practicalMax}
                                          </p>
                                        </div>
                                      )}
                                      <div className="w-px h-10 bg-gray-200" />
                                      {/* Total */}
                                      <div className="text-center min-w-[80px]">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Total</p>
                                        <p className="text-lg font-bold text-indigo-700">
                                          {subTotal} / {subMax}
                                        </p>
                                      </div>
                                      <div className="w-px h-10 bg-gray-200" />
                                      <div className="text-center min-w-[90px]">
                                        <p className="text-xs text-gray-500 mb-1 font-medium">Grade</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${g.cls}`}>
                                          {g.label}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">Pending</p>
                                  )}
                                </div>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`bg-gradient-to-r ${subPct !== null ? barColor(subPct) : 'from-gray-300 to-gray-300'} h-2 rounded-full transition-all duration-500`}
                                  style={{ width: subPct !== null ? `${Math.min(subPct, 100)}%` : '0%' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Overall footer — same as UT Results */}
                      <div className="mt-6 pt-5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-700">Final Semester Percentage</span>
                          <span className="text-xl font-bold text-purple-600">{semData.finalPercentage.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`bg-gradient-to-r ${barColor(semData.finalPercentage)} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(semData.finalPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">0%</span>
                          <span className="text-xs text-gray-400">50%</span>
                          <span className="text-xs text-gray-400">100%</span>
                        </div>
                      </div>
                    </div>

                    {/* ── All Semesters Overview (only when multiple sems) ── */}
                    {results.length > 1 && (
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          All Semesters Overview
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.map(r => {
                            const g = gradeLabel(r.finalPercentage);
                            return (
                              <button key={r.semester} onClick={() => setActiveSem(r.semester)}
                                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                  activeSem === r.semester
                                    ? 'border-purple-400 bg-purple-50'
                                    : 'border-gray-100 hover:border-indigo-200'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-bold text-gray-700">Semester {r.semester}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${g.cls}`}>
                                    {r.grade || g.label}
                                  </span>
                                </div>
                                <p className="text-xl font-bold text-purple-600">{r.finalPercentage.toFixed(1)}%</p>
                                <p className="text-xs text-gray-400 mt-1">{r.subjects.length} subjects</p>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`bg-gradient-to-r ${barColor(r.finalPercentage)} h-1.5 rounded-full`}
                                    style={{ width: `${Math.min(r.finalPercentage, 100)}%` }}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default MSBTEResults;
