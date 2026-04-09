import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const INITIAL_FORM = { rollNo: '', semester: '3', finalPercentage: '' };

const navItems = [
  { name: 'Dashboard',     path: '/staff/dashboard' },
  { name: 'Complaints',    path: '/staff/complaints' },
  { name: 'UT Results',    path: '/staff/results' },
  { name: 'MSBTE Results', path: '/staff/msbte-results' },
];

const StaffMSBTEResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [form, setForm]                     = useState(INITIAL_FORM);
  const [compulsory, setCompulsory]         = useState([]);   // [{code,name}]
  const [electives, setElectives]           = useState([]);   // [{code,name}]
  const [electiveLabel, setElectiveLabel]   = useState(null); // 'Elective I' | 'Elective II' | null
  const [selectedElective, setSelectedElective] = useState(null); // {code,name} | null
  const [marks, setMarks]                   = useState({});   // { code: value }
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [msg, setMsg]                       = useState({ text: '', type: '' });
  const [submitted, setSubmitted]           = useState([]);
  const [tableLoading, setTableLoading]     = useState(false);
  const [expandedRow, setExpandedRow]       = useState(null);

  // ── Load subjects when semester changes ──────────────────────────────────
  const loadSubjects = useCallback(async (sem) => {
    try {
      setSubjectsLoading(true);
      setCompulsory([]);
      setElectives([]);
      setElectiveLabel(null);
      setSelectedElective(null);
      setMarks({});
      const res = await api.get(`/staff/msbte-subjects/${sem}`);
      if (res.data.success) {
        const { compulsory: comp, electives: elec, electiveLabel: label } = res.data.data;
        setCompulsory(comp || []);
        setElectives(elec || []);
        setElectiveLabel(label || null);
        // Pre-fill marks for compulsory only
        const init = {};
        (comp || []).forEach(s => { init[s.code] = ''; });
        setMarks(init);
      }
    } catch (_) {
      setCompulsory([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects(form.semester);
    fetchSubmitted();
  }, []); // eslint-disable-line

  useEffect(() => {
    loadSubjects(form.semester);
  }, [form.semester, loadSubjects]);

  // When elective selection changes, add/remove its marks slot
  const handleElectiveSelect = (sub) => {
    setSelectedElective(sub);
    setMarks(prev => {
      const next = { ...prev };
      // Remove old elective marks
      electives.forEach(e => { delete next[e.code]; });
      // Add new elective slot
      next[sub.code] = '';
      return next;
    });
  };

  const fetchSubmitted = async () => {
    try {
      setTableLoading(true);
      const res = await api.get('/staff/msbte-results');
      if (res.data.success) setSubmitted(res.data.data);
    } catch (_) {}
    finally { setTableLoading(false); }
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.rollNo.trim()) return 'Roll number is required';
    if (!form.semester)      return 'Semester is required';
    if (compulsory.length === 0) return 'No subjects loaded for this semester';

    for (const s of compulsory) {
      const v = marks[s.code];
      if (v === '' || v == null) return `Marks for "${s.name}" are required`;
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 100) return `Marks for "${s.name}" must be 0–100`;
    }

    if (electives.length > 0) {
      if (!selectedElective) return `Please select one ${electiveLabel || 'elective'} subject`;
      const v = marks[selectedElective.code];
      if (v === '' || v == null) return `Marks for "${selectedElective.name}" are required`;
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 100) return `Marks for "${selectedElective.name}" must be 0–100`;
    }

    if (form.finalPercentage === '') return 'Final semester percentage is required';
    const pct = parseFloat(form.finalPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) return 'Final percentage must be 0–100';

    return null;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setMsg({ text: err, type: 'error' }); return; }

    // Build subjects array: compulsory + selected elective
    const subjectsPayload = [
      ...compulsory.map(s => ({ code: s.code, name: s.name, marks: parseFloat(marks[s.code]) })),
      ...(selectedElective
        ? [{ code: selectedElective.code, name: selectedElective.name, marks: parseFloat(marks[selectedElective.code]) }]
        : []),
    ];

    try {
      setSubmitting(true);
      setMsg({ text: '', type: '' });

      await api.post('/staff/add-msbte-result', {
        rollNo:          form.rollNo.trim().toUpperCase(),
        semester:        parseInt(form.semester),
        subjects:        subjectsPayload,
        elective:        selectedElective || null,
        finalPercentage: parseFloat(form.finalPercentage),
        resultType:      'MSBTE',
      });

      setMsg({ text: 'MSBTE result submitted successfully. Awaiting admin approval.', type: 'success' });
      setForm(INITIAL_FORM);
      setSelectedElective(null);
      const reset = {};
      compulsory.forEach(s => { reset[s.code] = ''; });
      setMarks(reset);
      fetchSubmitted();
    } catch (e) {
      setMsg({ text: e.response?.data?.message || 'Failed to submit result', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render mark-input row (plain function, NOT a component — avoids remount on each keystroke) ──
  const renderMarkRow = (sub, isElective = false) => (
    <div
      key={sub.code}
      className={`flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 ${isElective ? 'bg-amber-50/60' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{sub.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-gray-400">{sub.code}</p>
          {isElective && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              {electiveLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          value={marks[sub.code] ?? ''}
          onChange={e => {
            const raw = e.target.value;
            if (raw === '' || raw === '-') {
              setMarks(prev => ({ ...prev, [sub.code]: '' }));
              return;
            }
            const n = parseFloat(raw);
            if (isNaN(n) || n < 0) {
              setMarks(prev => ({ ...prev, [sub.code]: '0' }));
            } else if (n > 100) {
              setMarks(prev => ({ ...prev, [sub.code]: '100' }));
            } else {
              setMarks(prev => ({ ...prev, [sub.code]: raw }));
            }
          }}
          min="0"
          max="100"
          step="1"
          placeholder="0–100"
          className="w-24 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-400 focus:border-transparent px-3 py-2 text-sm text-center transition-all"
        />
        <span className="text-xs text-gray-400 w-8">/ 100</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">Staff Panel</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}>
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white transition-all">
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MSBTE Result Entry</h1>
            <p className="text-sm text-gray-500">Semester-wise marks with elective selection — hidden until admin approves</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'Staff'}</p>
              <p className="text-xs text-gray-500">{user?.department}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Entry Form ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Enter MSBTE Results
            </h2>

            {msg.text && (
              <div className={`mb-5 p-4 rounded-xl text-sm font-medium ${
                msg.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg.type === 'success' ? '✅' : '❌'} {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Roll No + Semester */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.rollNo}
                    onChange={e => setForm({ ...form, rollNo: e.target.value })}
                    placeholder="e.g. CS2021001"
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3 transition-all"
                  >
                    {[1,2,3,4,5,6].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {subjectsLoading && (
                <div className="flex items-center gap-2 text-sm text-indigo-500 mb-4">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Loading subjects for Semester {form.semester}...
                </div>
              )}

              {/* ── Compulsory Subjects ── */}
              {!subjectsLoading && compulsory.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-indigo-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      Compulsory Subjects
                    </h3>
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                      {compulsory.length} subjects
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {compulsory.map(sub => renderMarkRow(sub))}
                  </div>
                </div>
              )}

              {/* ── Elective Section ── */}
              {!subjectsLoading && electives.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-5 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      {electiveLabel || 'Elective'} — Select ONE
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Choose 1 of {electives.length}
                    </span>
                  </div>

                  {/* Radio selection */}
                  <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden mb-3">
                    {electives.map((sub, idx) => (
                      <label
                        key={sub.code}
                        className={`flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors ${
                          selectedElective?.code === sub.code
                            ? 'bg-amber-100 border-l-4 border-amber-500'
                            : 'hover:bg-amber-100/50'
                        } ${idx !== electives.length - 1 ? 'border-b border-amber-100' : ''}`}
                      >
                        <input
                          type="radio"
                          name="elective"
                          value={sub.code}
                          checked={selectedElective?.code === sub.code}
                          onChange={() => handleElectiveSelect(sub)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                          <p className="text-xs text-gray-400">{sub.code}</p>
                        </div>
                        {selectedElective?.code === sub.code && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            Selected
                          </span>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Marks input for selected elective */}
                  {selectedElective && (
                    <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
                      <div className="px-4 py-2 bg-amber-100 border-b border-amber-200">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                          Enter marks for selected {electiveLabel}
                        </p>
                      </div>
                      {renderMarkRow(selectedElective, true)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Final Percentage ── */}
              {!subjectsLoading && compulsory.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Final Semester Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3 max-w-xs">
                    <input
                      type="number"
                      value={form.finalPercentage}
                      onChange={e => {
                        const raw = e.target.value;
                        if (raw === '') { setForm({ ...form, finalPercentage: '' }); return; }
                        const n = parseFloat(raw);
                        if (isNaN(n) || n < 0) {
                          setForm({ ...form, finalPercentage: '0' });
                        } else if (n > 100) {
                          setForm({ ...form, finalPercentage: '100' });
                        } else {
                          setForm({ ...form, finalPercentage: raw });
                        }
                      }}
                      min="0" max="100" step="0.01"
                      placeholder="e.g. 72.50"
                      className="flex-1 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3 text-lg font-bold text-purple-700 transition-all"
                    />
                    <span className="text-2xl font-bold text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the official MSBTE final semester percentage</p>
                </div>
              )}

              <input type="hidden" value="MSBTE" readOnly />

              <button
                type="submit"
                disabled={submitting || subjectsLoading || compulsory.length === 0}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit MSBTE Result'}
              </button>
            </form>
          </div>

          {/* ── Submitted Results Table ── */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">My Submitted MSBTE Results</h2>
              <button onClick={fetchSubmitted}
                className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-200 transition-all text-sm">
                Refresh
              </button>
            </div>

            {tableLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
              </div>
            ) : submitted.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm font-medium">No MSBTE results submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submitted.map(r => (
                  <div key={r._id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          S{r.semester}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{r.rollNo} — Semester {r.semester}</p>
                          <p className="text-xs text-gray-500">
                            {r.subjects?.length || 0} subjects
                            {r.elective ? ` • Elective: ${r.elective.name}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-purple-600">{r.finalPercentage?.toFixed(1)}%</span>
                        {r.grade && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${GRADE_STYLE[r.grade] || 'bg-gray-100 text-gray-600'}`}>
                            {r.grade}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status] || ''}`}>
                          {r.status}
                        </span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === r._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {expandedRow === r._id && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                        {/* Compulsory subjects */}
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Compulsory Subjects</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                          {r.subjects?.filter(s => !r.elective || s.code !== r.elective.code).map(s => (
                            <div key={s.code} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <div>
                                <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-400">{s.code}</p>
                              </div>
                              <span className="text-sm font-bold text-indigo-600">{s.marks}</span>
                            </div>
                          ))}
                        </div>

                        {/* Elective subject */}
                        {r.elective && (
                          <>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Elective Subject</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                              {r.subjects?.filter(s => s.code === r.elective.code).map(s => (
                                <div key={s.code} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                                    <p className="text-xs text-amber-500">{s.code} • Elective</p>
                                  </div>
                                  <span className="text-sm font-bold text-amber-600">{s.marks}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {r.rejectedReason && (
                          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                            Rejection reason: {r.rejectedReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default StaffMSBTEResults;
