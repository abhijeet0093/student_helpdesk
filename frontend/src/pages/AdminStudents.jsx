import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const DEPT_COLORS = {
  Computer:   'bg-blue-50 text-blue-700',
  IT:         'bg-purple-50 text-purple-700',
  ENTC:       'bg-green-50 text-green-700',
  Mechanical: 'bg-orange-50 text-orange-700',
  Civil:      'bg-yellow-50 text-yellow-700',
};

/* ── Shared modal shell ── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

/* ── View Student Modal ── */
const ViewStudentModal = ({ student, onClose }) => (
  <Modal title="Student Details" onClose={onClose}>
    <div className="flex flex-col items-center mb-6">
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-3">
        {student.fullName?.charAt(0).toUpperCase() || 'S'}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{student.fullName}</h3>
      <span className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold ${DEPT_COLORS[student.department] || 'bg-gray-100 text-gray-600'}`}>
        {student.department}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Roll Number',   value: student.rollNumber },
        { label: 'Enrollment No', value: student.enrollmentNumber },
        { label: 'Semester',      value: student.semester },
        { label: 'Email',         value: student.email },
        { label: 'Year',          value: student.year || '—' },
        { label: 'Status',        value: student.isActive === false ? 'Inactive' : 'Active' },
      ].map(({ label, value }) => (
        <div key={label} className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-800 break-all">{value ?? '—'}</p>
        </div>
      ))}
    </div>
  </Modal>
);

const AdminStudents = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [filter,       setFilter]       = useState({ department: '', semester: '', search: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [showUpload,   setShowUpload]   = useState(false);
  const [viewStudent,  setViewStudent]  = useState(null);

  useEffect(() => { fetchStudents(); }, [filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.department) params.append('department', filter.department);
      if (filter.semester)   params.append('semester',   filter.semester);
      if (filter.search)     params.append('search',     filter.search);
      const res = await api.get(`/admin/students?${params.toString()}`);
      if (res.data.success) setStudents(res.data.data);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please select an Excel file (.xlsx or .xls)'); return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) { alert('Please select a file first'); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await api.post('/admin/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const d = res.data.data;
      setUploadResult({
        total:   d.total   ?? 0,
        success: typeof d.success === 'number' ? d.success : (d.successList?.length ?? 0),
        failed:  typeof d.failed  === 'number' ? d.failed  : (d.errors?.length    ?? 0),
        errors:  d.errors  ?? []
      });
      alert(res.data.message);
      setSelectedFile(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res  = await api.get('/admin/students/template', { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'student_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert('Failed to download template'); }
  };

  const handleDeleteStudent = async (studentId, rollNumber) => {
    if (!window.confirm(`Delete student ${rollNumber}?`)) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      alert('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  /* same menu items as AdminStaff */
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Students', path: '/admin/students', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { name: 'Complaints', path: '/admin/complaints', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { name: 'UT Results', path: '/admin/results', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { name: 'Staff', path: '/admin/staff', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-fade-in">

      {/* ── Sidebar — identical to AdminStaff ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 opacity-50" />
        <div className="p-6 border-b border-slate-700/50 relative z-10 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Admin Panel</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in-right ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-105 hover:shadow-md'
                }`}>
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700/50 relative z-10">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white transition-all duration-300 hover:scale-105">
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

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar — identical to AdminStaff */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-4 flex justify-between items-center animate-slide-up sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Student Management</h1>
            <p className="text-sm text-gray-600">Manage enrolled students</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
              <p className="text-xs text-indigo-600 font-medium">Administrator</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search by roll no, name, or enrollment..."
                value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors" />
            </div>
            <select value={filter.department} onChange={e => setFilter({ ...filter, department: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
              <option value="">All Departments</option>
              {['Computer','IT','ENTC','Mechanical','Civil'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filter.semester} onChange={e => setFilter({ ...filter, semester: e.target.value })}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white">
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <button onClick={() => setShowUpload(!showUpload)}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Excel
            </button>
          </div>

          {/* Upload Panel */}
          {showUpload && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 animate-scale-in" style={{ animationDelay: '0.15s' }}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  Bulk Upload Students
                </h2>
                <button onClick={() => setShowUpload(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <button onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template
                  </button>
                  <label htmlFor="file-upload"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Select Excel File
                    <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-upload" />
                  </label>
                  {selectedFile && (
                    <>
                      <span className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedFile.name}
                      </span>
                      <button onClick={handleUpload} disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm">
                        {uploading
                          ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading...</>
                          : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Upload</>
                        }
                      </button>
                    </>
                  )}
                </div>
                {uploadResult && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Upload Results</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Total',   value: uploadResult.total,   color: 'text-gray-800' },
                        { label: 'Success', value: uploadResult.success, color: 'text-green-600' },
                        { label: 'Failed',  value: uploadResult.failed,  color: 'text-red-500'  },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                          <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {uploadResult.failed > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700">
                          View Failed Records ({uploadResult.failed})
                        </summary>
                        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                          {uploadResult.errors.map((fail, idx) => (
                            <div key={idx} className="text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                              <span className="font-semibold">Row {fail.row}:</span> {fail.reason}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Instructions</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700">
                    <li>Download the Excel template</li>
                    <li>Fill in: <span className="font-medium">rollNumber, enrollmentNumber, fullName, department, year</span></li>
                    <li>Upload the completed file</li>
                    <li>Default password: <span className="font-bold bg-blue-100 px-1 rounded">student@123</span></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Table Card — same structure as AdminStaff */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                Student List
              </h2>
              <span className="text-sm text-gray-500 font-medium">{students.length} student{students.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center"><Loader message="Loading students..." /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                    <tr>
                      {['#','Roll No','Student Name','Enrollment No','Department','Semester','Email','Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-5 py-16 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <p className="font-medium text-gray-500">No students found</p>
                            <p className="text-xs text-gray-400">Upload an Excel file to add students</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => (
                        <tr key={student._id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                          <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">{student.rollNumber}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                {student.fullName?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <span className="font-semibold text-gray-900">{student.fullName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-600 font-mono text-xs">{student.enrollmentNumber}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${DEPT_COLORS[student.department] || 'bg-gray-100 text-gray-600'}`}>
                              {student.department}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                              {student.semester}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600 text-xs">{student.email}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setViewStudent(student)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-md">
                                View
                              </button>
                              <button onClick={() => handleDeleteStudent(student._id, student.rollNumber)}
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200 hover:shadow-md">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Modals */}
      {viewStudent && <ViewStudentModal student={viewStudent} onClose={() => setViewStudent(null)} />}

    </div>
  );
};

export default AdminStudents;
