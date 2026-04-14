import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";

const menuItems = [
  { name: "Dashboard",       path: "/dashboard" },
  { name: "Raise Complaint", path: "/complaints/new" },
  { name: "My Complaints",   path: "/complaints" },
  { name: "UT Results",      path: "/results" },
  { name: "Student Corner",  path: "/corner" },
  { name: "AI Assistant",    path: "/ai-chat" },
];

const gradeColor = (g) => {
  if (!g) return "bg-gray-100 text-gray-600";
  if (g === "Distinction")  return "bg-purple-100 text-purple-700";
  if (g === "First Class")  return "bg-green-100 text-green-700";
  if (g === "Second Class") return "bg-blue-100 text-blue-700";
  if (g === "Pass")         return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const pctColor = (p) => {
  if (p >= 75) return "text-green-600";
  if (p >= 60) return "text-blue-600";
  if (p >= 50) return "text-yellow-600";
  return "text-red-600";
};

const pctBg = (p) => {
  if (p >= 75) return "bg-green-500";
  if (p >= 60) return "bg-blue-500";
  if (p >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

// Generate exam tips based on subject performance
const getExamTips = (subjects) => {
  const tips = [];
  const weak  = subjects.filter(s => s.ut1 && s.ut2 && ((s.ut1.marksObtained/s.ut1.maxMarks + s.ut2.marksObtained/s.ut2.maxMarks)/2) < 0.5);
  const avg   = subjects.filter(s => s.ut1 && s.ut2 && ((s.ut1.marksObtained/s.ut1.maxMarks + s.ut2.marksObtained/s.ut2.maxMarks)/2) >= 0.5 && ((s.ut1.marksObtained/s.ut1.maxMarks + s.ut2.marksObtained/s.ut2.maxMarks)/2) < 0.7);
  const strong = subjects.filter(s => s.ut1 && s.ut2 && ((s.ut1.marksObtained/s.ut1.maxMarks + s.ut2.marksObtained/s.ut2.maxMarks)/2) >= 0.7);
  if (weak.length > 0)   tips.push({ icon: "��", color: "border-red-400 bg-red-50",    title: "Focus Areas", text: `Revise ${weak.map(s=>s.subjectName).join(", ")} thoroughly. Practice previous year questions and solve extra exercises.` });
  if (avg.length > 0)    tips.push({ icon: "🟡", color: "border-yellow-400 bg-yellow-50", title: "Improve These", text: `${avg.map(s=>s.subjectName).join(", ")} need more practice. Aim for concept clarity and formula revision.` });
  if (strong.length > 0) tips.push({ icon: "🟢", color: "border-green-400 bg-green-50",  title: "Strong Subjects", text: `Keep up the good work in ${strong.map(s=>s.subjectName).join(", ")}. Quick revision before exam is enough.` });
  tips.push({ icon: "📅", color: "border-indigo-400 bg-indigo-50", title: "Study Plan", text: "Dedicate 2-3 hours daily. Solve 10 questions per subject every day. Attempt mock tests 1 week before exam." });
  tips.push({ icon: "📝", color: "border-purple-400 bg-purple-50", title: "Exam Strategy", text: "Read all questions first. Attempt easy ones first. Show all steps in numerical problems. Manage time — 1 mark per minute." });
  return tips;
};

const UTResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading: authLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [msbteData, setMsbteData]       = useState([]);
  const [utData, setUtData]             = useState({ current: [], archived: [], currentSemesters: [] });
  const [activeTab, setActiveTab]       = useState("ut");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSem, setSelectedSem]   = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchAll();
  }, [user, authLoading]); // eslint-disable-line

  const fetchAll = async () => {
    try {
      setLoading(true); setError("");
      const [msbteRes, utRes] = await Promise.all([
        api.get("/results/msbte"),
        api.get("/results/ut/all"),
      ]);
      if (msbteRes.data.success) setMsbteData(msbteRes.data.data || []);
      if (utRes.data.success) {
        const d = utRes.data.data;
        setUtData(d);
        const semsWithData = [...new Set((d.current || []).map(r => r.semester))].sort((a,b)=>a-b);
        setSelectedSem(semsWithData[0] || (d.currentSemesters||[])[0] || 1);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load results");
    } finally { setLoading(false); }
  };

  const groupUT = (results, sem) => {
    const filtered = (results||[]).filter(r => r.semester === sem);
    const map = new Map();
    filtered.forEach(r => {
      if (!map.has(r.subjectCode)) map.set(r.subjectCode, { subjectCode: r.subjectCode, subjectName: r.subjectName, ut1: null, ut2: null });
      const s = map.get(r.subjectCode);
      const e = { marksObtained: r.marksObtained, maxMarks: r.maxMarks };
      if (r.utType === "UT1") s.ut1 = e; else s.ut2 = e;
    });
    return Array.from(map.values());
  };

  // Compute analytics for a semester
  const computeAnalytics = (subjects) => {
    const withBoth = subjects.filter(s => s.ut1 && s.ut2);
    const withUT1  = subjects.filter(s => s.ut1);
    const withUT2  = subjects.filter(s => s.ut2);
    const pct = (m, mx) => mx > 0 ? ((m/mx)*100) : 0;

    const ut1Total = withUT1.reduce((a,s)=>a+s.ut1.marksObtained,0);
    const ut1Max   = withUT1.reduce((a,s)=>a+s.ut1.maxMarks,0);
    const ut2Total = withUT2.reduce((a,s)=>a+s.ut2.marksObtained,0);
    const ut2Max   = withUT2.reduce((a,s)=>a+s.ut2.maxMarks,0);

    const ut1Pct = ut1Max > 0 ? (ut1Total/ut1Max)*100 : 0;
    const ut2Pct = ut2Max > 0 ? (ut2Total/ut2Max)*100 : 0;

    const improved  = withBoth.filter(s => pct(s.ut2.marksObtained,s.ut2.maxMarks) > pct(s.ut1.marksObtained,s.ut1.maxMarks));
    const declined  = withBoth.filter(s => pct(s.ut2.marksObtained,s.ut2.maxMarks) < pct(s.ut1.marksObtained,s.ut1.maxMarks));
    const same      = withBoth.filter(s => pct(s.ut2.marksObtained,s.ut2.maxMarks) === pct(s.ut1.marksObtained,s.ut1.maxMarks));

    const subjectStats = subjects.map(s => {
      const p1 = s.ut1 ? pct(s.ut1.marksObtained, s.ut1.maxMarks) : null;
      const p2 = s.ut2 ? pct(s.ut2.marksObtained, s.ut2.maxMarks) : null;
      const avg = p1!=null && p2!=null ? (p1+p2)/2 : (p1??p2??0);
      return { ...s, p1, p2, avg };
    }).sort((a,b)=>b.avg-a.avg);

    return { ut1Total, ut1Max, ut1Pct, ut2Total, ut2Max, ut2Pct, improved, declined, same, subjectStats };
  };

  const utSems = [...new Set((utData.current||[]).map(r=>r.semester))].sort((a,b)=>a-b);
  if (utSems.length===0 && utData.currentSemesters?.length) utSems.push(...utData.currentSemesters);
  const archivedSems = [...new Set((utData.archived||[]).map(r=>r.semester))].sort((a,b)=>a-b);
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <aside className={`${sidebarOpen?"w-64":"w-20"} bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative z-20 overflow-hidden flex-shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50"/>
        <div className="p-6 border-b border-indigo-500/30 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Smart Campus</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {menuItems.map(item=>(
            <button key={item.path} onClick={()=>navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname===item.path?"bg-white text-indigo-600 shadow-lg scale-105":"text-indigo-100 hover:bg-indigo-700/50 hover:text-white hover:scale-105"}`}>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-500/30 relative z-10">
          <button onClick={()=>{logout();navigate("/login");}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-600 hover:text-white transition-all">
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-20">
          <svg className={`w-4 h-4 transform transition-transform ${sidebarOpen?"":"rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Results</h1>
            <p className="text-sm text-gray-600">{user?.fullName} - {user?.rollNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} disabled={loading} className="p-2.5 text-gray-600 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110 disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">{user?.fullName?.charAt(0).toUpperCase()||"S"}</div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.rollNumber}</p>
                <p className="text-xs text-indigo-600 font-medium">{user?.department}</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader message="Loading results..."/></div>
        ) : (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 flex justify-between"><span>{error}</span><button onClick={fetchAll} className="font-semibold hover:underline ml-4">Retry</button></div>}

            <div className="bg-white rounded-2xl shadow-lg p-1.5 flex gap-1">
              <button onClick={()=>setActiveTab("ut")} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab==="ut"?"bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md":"text-gray-600 hover:bg-gray-50"}`}>UT Results</button>
              <button onClick={()=>setActiveTab("msbte")} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab==="msbte"?"bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md":"text-gray-600 hover:bg-gray-50"}`}>MSBTE Results</button>
            </div>

            {activeTab==="ut" && (
              <div className="space-y-6">
                {utSems.length>0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Current Semester Results</p>
                    <div className="flex gap-3 flex-wrap">
                      {utSems.map(s=>(
                        <button key={s} onClick={()=>setSelectedSem(s)} className={`flex-1 min-w-[120px] py-3 rounded-xl font-semibold transition-all duration-300 ${selectedSem===s?"bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg scale-105":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Semester {s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSem!==null && (()=>{
                  const subjects = groupUT(utData.current, selectedSem);
                  const analytics = subjects.length>0 ? computeAnalytics(subjects) : null;
                  const tips = analytics ? getExamTips(subjects) : [];
                  return subjects.length>0 ? (
                    <>
                      {/* Subject Results Card */}
                      <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">{selectedSem}</span>
                            Semester {selectedSem} - UT Results
                          </h2>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Published</span>
                        </div>
                        <div className="space-y-3">
                          {subjects.map((sub,i)=>(
                            <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-indigo-50/40 transition-all hover:shadow-md">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900">{sub.subjectName}</h3>
                                  <p className="text-xs text-gray-500">{sub.subjectCode}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">UT-1</p>
                                    {sub.ut1?<p className="text-base font-bold text-gray-900">{sub.ut1.marksObtained}/{sub.ut1.maxMarks}</p>:<p className="text-xs text-gray-400 italic">Pending</p>}
                                  </div>
                                  <div className="w-px h-8 bg-gray-200"/>
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">UT-2</p>
                                    {sub.ut2?<p className="text-base font-bold text-gray-900">{sub.ut2.marksObtained}/{sub.ut2.maxMarks}</p>:<p className="text-xs text-gray-400 italic">Pending</p>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analytics Section */}
                      {analytics && (
                        <div className="space-y-4">
                          {/* UT1 vs UT2 Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                              <div className="flex items-center justify-between mb-3">
                                <div><p className="text-indigo-100 text-xs uppercase tracking-wide">Semester {selectedSem}</p><h3 className="text-xl font-bold">UT-1 Summary</h3></div>
                                <span className="text-3xl">📝</span>
                              </div>
                              <p className="text-3xl font-bold mb-1">{analytics.ut1Pct.toFixed(1)}%</p>
                              <p className="text-indigo-100 text-sm">{analytics.ut1Total} / {analytics.ut1Max} marks</p>
                              <div className="mt-3 w-full bg-white/20 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{width:`${Math.min(analytics.ut1Pct,100)}%`}}/></div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                              <div className="flex items-center justify-between mb-3">
                                <div><p className="text-purple-100 text-xs uppercase tracking-wide">Semester {selectedSem}</p><h3 className="text-xl font-bold">UT-2 Summary</h3></div>
                                <span className="text-3xl">📋</span>
                              </div>
                              <p className="text-3xl font-bold mb-1">{analytics.ut2Pct.toFixed(1)}%</p>
                              <p className="text-purple-100 text-sm">{analytics.ut2Total} / {analytics.ut2Max} marks</p>
                              <div className="mt-3 w-full bg-white/20 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{width:`${Math.min(analytics.ut2Pct,100)}%`}}/></div>
                            </div>
                          </div>

                          {/* UT1 vs UT2 Comparison */}
                          {analytics.ut1Max>0 && analytics.ut2Max>0 && (
                            <div className={`rounded-2xl p-5 text-white shadow-lg ${analytics.ut2Pct>analytics.ut1Pct?"bg-gradient-to-r from-green-500 to-emerald-600":analytics.ut2Pct<analytics.ut1Pct?"bg-gradient-to-r from-red-500 to-rose-600":"bg-gradient-to-r from-gray-500 to-slate-600"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-bold mb-1">UT1 vs UT2 Comparison</h3>
                                  <p className="text-white/80 text-sm">
                                    {analytics.ut2Pct>analytics.ut1Pct
                                      ? `Improved by ${(analytics.ut2Pct-analytics.ut1Pct).toFixed(1)}% from UT1 to UT2`
                                      : analytics.ut2Pct<analytics.ut1Pct
                                      ? `Declined by ${(analytics.ut1Pct-analytics.ut2Pct).toFixed(1)}% from UT1 to UT2`
                                      : "Performance remained the same in both UTs"}
                                  </p>
                                </div>
                                <span className="text-4xl">{analytics.ut2Pct>analytics.ut1Pct?"📈":analytics.ut2Pct<analytics.ut1Pct?"📉":"➡️"}</span>
                              </div>
                            </div>
                          )}

                          {/* Subject-wise comparison */}
                          <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm">📊</span>
                              Subject-wise Performance Analysis
                            </h3>
                            <div className="space-y-3">
                              {analytics.subjectStats.map((s,i)=>(
                                <div key={i} className="bg-gray-50 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 text-sm">{s.subjectName}</p>
                                      <p className="text-xs text-gray-400">{s.subjectCode}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                      {s.p1!=null && <span className="text-indigo-600 font-semibold">UT1: {s.p1.toFixed(0)}%</span>}
                                      {s.p1!=null && s.p2!=null && <span className="text-gray-400">→</span>}
                                      {s.p2!=null && <span className={`font-semibold ${s.p2>s.p1?"text-green-600":s.p2<s.p1?"text-red-600":"text-gray-600"}`}>UT2: {s.p2.toFixed(0)}%</span>}
                                      {s.p1!=null && s.p2!=null && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.p2>s.p1?"bg-green-100 text-green-700":s.p2<s.p1?"bg-red-100 text-red-700":"bg-gray-100 text-gray-600"}`}>
                                          {s.p2>s.p1?"↑ Improved":s.p2<s.p1?"↓ Declined":"= Same"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className={`${pctBg(s.avg)} h-2 rounded-full transition-all duration-500`} style={{width:`${Math.min(s.avg,100)}%`}}/>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                                <p className="text-2xl font-bold text-green-600">{analytics.improved.length}</p>
                                <p className="text-xs text-gray-600 font-medium">Improved</p>
                              </div>
                              <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                                <p className="text-2xl font-bold text-red-600">{analytics.declined.length}</p>
                                <p className="text-xs text-gray-600 font-medium">Declined</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                <p className="text-2xl font-bold text-gray-600">{analytics.same.length}</p>
                                <p className="text-xs text-gray-600 font-medium">Same</p>
                              </div>
                            </div>
                          </div>

                          {/* Exam Preparation Tips */}
                          <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <span className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm">💡</span>
                              Final Exam Preparation Tips
                            </h3>
                            <div className="space-y-3">
                              {tips.map((tip,i)=>(
                                <div key={i} className={`rounded-xl p-4 border-l-4 ${tip.color}`}>
                                  <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">{tip.icon}</span>
                                    <div>
                                      <p className="font-bold text-gray-900 text-sm mb-1">{tip.title}</p>
                                      <p className="text-sm text-gray-600">{tip.text}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                      <div className="text-5xl mb-3">📊</div>
                      <p className="font-bold text-gray-900">No UT results for Semester {selectedSem}</p>
                      <p className="text-sm text-gray-500 mt-1">Results will appear once published by staff</p>
                    </div>
                  );
                })()}

                {archivedSems.length>0 && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <button onClick={()=>setShowArchived(!showArchived)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📦</span>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Archived UT Results</p>
                          <p className="text-xs text-gray-500">{utData.archived.length} result(s) from previous semesters</p>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${showArchived?"rotate-180":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {showArchived && (
                      <div className="border-t border-gray-100 p-5 space-y-4">
                        {archivedSems.map(sem=>{
                          const subjects = groupUT(utData.archived, sem);
                          return (
                            <div key={sem}>
                              <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{sem}</span>
                                Semester {sem}
                              </p>
                              <div className="space-y-2">
                                {subjects.map((sub,i)=>(
                                  <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800 text-sm">{sub.subjectName}</p>
                                      <p className="text-xs text-gray-400">{sub.subjectCode}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                      {sub.ut1 && <span className="text-gray-600">UT1: <strong>{sub.ut1.marksObtained}/{sub.ut1.maxMarks}</strong></span>}
                                      {sub.ut2 && <span className="text-gray-600">UT2: <strong>{sub.ut2.marksObtained}/{sub.ut2.maxMarks}</strong></span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {utData.current.length===0 && utData.archived.length===0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No UT Results Yet</h2>
                    <p className="text-gray-500 text-sm">Results will appear once published by your department</p>
                  </div>
                )}
              </div>
            )}

            {activeTab==="msbte" && (
              <div className="space-y-4">
                {msbteData.length===0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No MSBTE Results</h2>
                    <p className="text-gray-500 text-sm">MSBTE board results will appear here once published by admin</p>
                  </div>
                ) : (
                  msbteData.map(sem=>(
                    <div key={sem.semester} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">{sem.semester}</span>
                          Semester {sem.semester} - MSBTE
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${pctColor(sem.finalPercentage)}`}>{sem.finalPercentage?.toFixed(1)}%</span>
                          {sem.grade && <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${gradeColor(sem.grade)}`}>{sem.grade}</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(sem.subjects||[]).map((sub,i)=>{
                          const isElective = sem.elective && sub.code===sem.elective.code;
                          return (
                            <div key={i} className={`flex items-center justify-between rounded-xl p-3 hover:shadow-sm transition-all ${isElective?"bg-amber-50 border border-amber-100":"bg-gray-50"}`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 text-sm">{sub.name}</p>
                                  {isElective && <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-semibold">Elective</span>}
                                </div>
                                <p className="text-xs text-gray-400">{sub.code}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {sub.theoryMarks != null && (
                                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                                    Theory: {sub.theoryMarks} / {sub.theoryMax}
                                  </span>
                                )}
                                {sub.practicalMarks != null && (
                                  <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                                    Practical: {sub.practicalMarks} / {sub.practicalMax}
                                  </span>
                                )}
                                {(() => {
                                  const total = sub.totalMarks ?? sub.marks ?? 0;
                                  const max   = sub.totalMax ?? 100;
                                  const pct   = max > 0 ? (total / max) * 100 : 0;
                                  return (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-sm font-bold text-gray-900">{total} / {max}</span>
                                      <span className={`text-sm font-bold ${pctColor(pct)}`}>{pct.toFixed(1)}%</span>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-semibold text-gray-500">Final Semester Percentage</span>
                          <span className={`text-sm font-bold ${pctColor(sem.finalPercentage)}`}>{sem.finalPercentage?.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2.5 rounded-full transition-all duration-500" style={{width:`${Math.min(sem.finalPercentage||0,100)}%`}}/>
                        </div>
                      </div>
                    </div>
                  ))
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