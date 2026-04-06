import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import resultService from "../services/resultService";
import Loader from "../components/Loader";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Raise Complaint", path: "/complaints/new" },
  { name: "My Complaints", path: "/complaints" },
  { name: "UT Results", path: "/results" },
  { name: "Student Corner", path: "/corner" },
  { name: "AI Assistant", path: "/ai-chat" },
];

const getGrade = (pct) => {
  const p = parseFloat(pct);
  if (p >= 75) return { label: "Excellent", cls: "text-green-700 bg-green-100" };
  if (p >= 60) return { label: "Good", cls: "text-blue-700 bg-blue-100" };
  if (p >= 50) return { label: "Average", cls: "text-yellow-700 bg-yellow-100" };
  return { label: "Needs Work", cls: "text-red-700 bg-red-100" };
};

const getYearSems = (year) => {
  const b = ((year || 1) - 1) * 2;
  return [b + 1, b + 2];
};

const UTResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSem, setSelectedSem] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actualYear, setActualYear] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchAll();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await resultService.getMyResults(null);
      console.log("[UTResults] API:", r);

      if (r.success) {
        const flat = r.data || [];
        const meta = r.meta || {};
        const dbYear = meta.studentYear || user?.year || 1;
        const dbSems = meta.validSemesters || getYearSems(dbYear);

        setActualYear(dbYear);
        setAllResults(flat);

        const semsWithData = [...new Set(flat.map((x) => x.semester))].sort((a, b) => a - b);
        const initSem = semsWithData.length > 0 ? semsWithData[0] : dbSems[0];

        console.log("[UTResults] dbYear:", dbYear, "dbSems:", dbSems, "initSem:", initSem, "records:", flat.length);

        setSelectedSem(initSem);
        buildData(flat, initSem, dbYear, dbSems);
      }
    } catch (e) {
      console.error("[UTResults] Error:", e);
      setError(e.response?.data?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const handleSemChange = (sem) => {
    setSelectedSem(sem);
    const dbYear = actualYear || user?.year || 1;
    buildData(allResults, sem, dbYear, getYearSems(dbYear));
  };

  const buildData = (flat, sem, dbYear, dbSems) => {
    const filtered = flat.filter((item) => item.semester === sem);
    console.log("[UTResults] sem:", sem, "filtered:", filtered.length);

    if (filtered.length === 0) {
      setResultsData({ results: [], summary: null, analysis: null, currentSemester: sem, dbYear, dbSems });
      return;
    }

    const subjectMap = new Map();
    filtered.forEach((item) => {
      if (!subjectMap.has(item.subjectCode)) {
        subjectMap.set(item.subjectCode, {
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          semester: item.semester,
          ut1: null,
          ut2: null,
        });
      }
      const s = subjectMap.get(item.subjectCode);
      const entry = {
        marksObtained: item.marksObtained,
        maxMarks: item.maxMarks,
        percentage: parseFloat(item.percentage).toFixed(2),
      };
      if (item.utType === "UT1") s.ut1 = entry;
      else if (item.utType === "UT2") s.ut2 = entry;
    });

    const ut1 = filtered.filter((x) => x.utType === "UT1");
    const ut2 = filtered.filter((x) => x.utType === "UT2");

    const calcSummary = (arr) => {
      if (!arr.length) return { totalMarks: 0, maxMarks: 0, percentage: "0", subjectsCount: 0 };
      const total = arr.reduce((s, x) => s + x.marksObtained, 0);
      const max = arr.reduce((s, x) => s + x.maxMarks, 0);
      return {
        totalMarks: total,
        maxMarks: max,
        percentage: max > 0 ? ((total / max) * 100).toFixed(2) : "0",
        subjectsCount: arr.length,
      };
    };

    // Compute UT1 vs UT2 analysis (mirrors backend performanceAnalyzer)
    let analysis = null;
    if (ut1.length > 0 && ut2.length > 0) {
      const ut1Map = new Map(ut1.map((r) => [r.subjectCode, r]));
      const ut2Map = new Map(ut2.map((r) => [r.subjectCode, r]));
      const improved = [], declined = [], consistent = [], weakSubjects = [], strongSubjects = [];

      ut1Map.forEach((r1, code) => {
        const r2 = ut2Map.get(code);
        if (!r2) return;
        const diff = parseFloat(r2.percentage) - parseFloat(r1.percentage);
        const info = {
          subjectName: r1.subjectName,
          subjectCode: code,
          ut1Percentage: parseFloat(r1.percentage).toFixed(2),
          ut2Percentage: parseFloat(r2.percentage).toFixed(2),
          difference: diff.toFixed(2),
        };
        if (diff > 5) improved.push(info);
        else if (diff < -5) declined.push(info);
        else consistent.push(info);
        if (parseFloat(r2.percentage) < 50) weakSubjects.push({ subjectName: r1.subjectName, percentage: parseFloat(r2.percentage).toFixed(2) });
        if (parseFloat(r2.percentage) >= 75) strongSubjects.push({ subjectName: r1.subjectName, percentage: parseFloat(r2.percentage).toFixed(2) });
      });

      let textSummary = "";
      if (improved.length > 0) textSummary += `Improved in ${improved.length} subject(s). `;
      if (declined.length > 0) textSummary += `Need more practice in ${declined.length} subject(s). `;
      if (weakSubjects.length > 0) textSummary += `Focus on: ${weakSubjects.map((s) => s.subjectName).join(", ")}.`;

      analysis = { improved, declined, consistent, weakSubjects, strongSubjects, textSummary: textSummary.trim() };
    }

    setResultsData({
      results: Array.from(subjectMap.values()),
      summary: { ut1: calcSummary(ut1), ut2: calcSummary(ut2) },
      analysis,
      currentSemester: sem,
      dbYear,
      dbSems,
    });
  };

  const sems = resultsData?.dbSems || getYearSems(actualYear || user?.year);
  const displayYear = resultsData?.dbYear || actualYear || user?.year || 1;
  const { results = [], summary, currentSemester } = resultsData || {};

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50" />
        <div className="p-6 border-b border-indigo-500/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Smart Campus</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-white text-indigo-600 shadow-lg scale-105" : "text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105"}`}>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-indigo-500/30 relative z-10">
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-600 hover:text-white transition-all duration-300">
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
          <svg className={`w-4 h-4 transform transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">UT Results</h1>
            <p className="text-sm text-gray-600">{user?.fullName} - {user?.rollNumber}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.rollNumber}</p>
              <p className="text-xs text-indigo-600 font-medium">{user?.department}</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader message="Loading results..." />
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Year {displayYear} - Semester {sems[0]} and {sems[1]}</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">Each semester: UT1 + UT2</span>
              </div>
              <div className="flex gap-3">
                {sems.map((s) => (
                  <button key={s} onClick={() => handleSemChange(s)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedSem === s ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg scale-105" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    Semester {s}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex justify-between items-center">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <button onClick={fetchAll} className="text-sm text-red-600 font-semibold hover:underline">Retry</button>
              </div>
            )}

            {!error && results.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center max-w-md mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Results Available</h2>
                <p className="text-gray-500 text-sm">UT1 and UT2 results for Semester {selectedSem} have not been published yet.</p>
              </div>
            )}

            {summary && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-indigo-100 text-xs uppercase tracking-wide">Semester {currentSemester}</p>
                      <h3 className="text-xl font-bold">UT-1 Summary</h3>
                    </div>
                    <span className="text-3xl">📝</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-indigo-100 text-sm">Total Marks</span><span className="text-2xl font-bold">{summary.ut1.totalMarks}/{summary.ut1.maxMarks}</span></div>
                    <div className="flex justify-between"><span className="text-indigo-100 text-sm">Percentage</span><span className="text-3xl font-bold">{summary.ut1.percentage}%</span></div>
                    <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(summary.ut1.percentage, 100)}%` }} /></div>
                    <p className="text-indigo-100 text-xs">{summary.ut1.subjectsCount} subject(s)</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-purple-100 text-xs uppercase tracking-wide">Semester {currentSemester}</p>
                      <h3 className="text-xl font-bold">UT-2 Summary</h3>
                    </div>
                    <span className="text-3xl">📋</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-purple-100 text-sm">Total Marks</span><span className="text-2xl font-bold">{summary.ut2.totalMarks}/{summary.ut2.maxMarks}</span></div>
                    <div className="flex justify-between"><span className="text-purple-100 text-sm">Percentage</span><span className="text-3xl font-bold">{summary.ut2.percentage}%</span></div>
                    <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(summary.ut2.percentage, 100)}%` }} /></div>
                    <p className="text-purple-100 text-xs">{summary.ut2.subjectsCount} subject(s)</p>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Semester {currentSemester} - Subject Results</h2>
                  <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-sm">{results.length} Subject(s)</span>
                </div>
                <div className="space-y-3">
                  {results.map((sub, i) => {
                    const g1 = sub.ut1 ? getGrade(sub.ut1.percentage) : null;
                    const g2 = sub.ut2 ? getGrade(sub.ut2.percentage) : null;
                    return (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-indigo-50/40 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{sub.subjectName}</h3>
                            <p className="text-xs text-gray-500">{sub.subjectCode}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[80px]">
                              <p className="text-xs text-gray-500 mb-1 font-medium">UT-1</p>
                              {sub.ut1 ? (<><p className="text-lg font-bold text-gray-900">{sub.ut1.marksObtained}/{sub.ut1.maxMarks}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${g1.cls}`}>{g1.label}</span></>) : (<p className="text-sm text-gray-400 italic">Pending</p>)}
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            <div className="text-center min-w-[80px]">
                              <p className="text-xs text-gray-500 mb-1 font-medium">UT-2</p>
                              {sub.ut2 ? (<><p className="text-lg font-bold text-gray-900">{sub.ut2.marksObtained}/{sub.ut2.maxMarks}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${g2.cls}`}>{g2.label}</span></>) : (<p className="text-sm text-gray-400 italic">Pending</p>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {summary && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-700">Overall Performance</span>
                      <span className="text-xl font-bold text-indigo-600">{summary.ut2?.percentage || summary.ut1?.percentage || "0"}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(summary.ut2?.percentage || summary.ut1?.percentage || 0), 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Analysis Section */}
            {resultsData?.analysis && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  UT1 vs UT2 Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-500">
                    <p className="font-bold text-gray-900 text-sm mb-1">📈 Improved</p>
                    <p className="text-3xl font-bold text-green-600">{resultsData.analysis.improved?.length || 0}</p>
                    <p className="text-xs text-gray-500">subject(s)</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-500">
                    <p className="font-bold text-gray-900 text-sm mb-1">📉 Need Attention</p>
                    <p className="text-3xl font-bold text-red-600">{resultsData.analysis.declined?.length || 0}</p>
                    <p className="text-xs text-gray-500">subject(s)</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                    <p className="font-bold text-gray-900 text-sm mb-1">💪 Strong Subjects</p>
                    <p className="text-3xl font-bold text-blue-600">{resultsData.analysis.strongSubjects?.length || 0}</p>
                    <p className="text-xs text-gray-500">subject(s)</p>
                  </div>
                </div>
                {resultsData.analysis.textSummary && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-800 font-medium">{resultsData.analysis.textSummary}</p>
                  </div>
                )}
                {resultsData.analysis.weakSubjects?.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Subjects needing focus:</p>
                    <div className="flex flex-wrap gap-2">
                      {resultsData.analysis.weakSubjects.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{s.subjectName} ({s.percentage}%)</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
};

export default UTResults;