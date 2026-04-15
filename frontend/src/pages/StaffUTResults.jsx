import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StaffUTResults = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [results, setResults] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter] = useState({ semester: '', department: '', utType: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('results');
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rollNo: '',
    subjectCode: '',
    subjectName: '',
    department: 'Computer',
    year: '2',
    semester: '3',
    utType: 'UT1',
    marksObtained: '',
    maxMarks: '30'
  });

  useEffect(() => {
    fetchResults();
    fetchSubjectsForSemester(formData.year, formData.semester);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch subjects when year or semester changes
  useEffect(() => {
    if (formData.year && formData.semester) {
      fetchSubjectsForSemester(formData.year, formData.semester);
    }
  }, [formData.year, formData.semester]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubjectsForSemester = async (year, semester) => {
    try {
      console.log('Fetching subjects for Year:', year, 'Semester:', semester);
      const response = await api.get(`/results/subjects/${year}/${semester}`);
      if (response.data.success) {
        setAvailableSubjects(response.data.data);
        console.log('Subjects loaded:', response.data.data);
      }
    } catch (err) {
      console.error('Fetch subjects error:', err);
      setAvailableSubjects([]);
      if (err.response?.status === 404) {
        alert(`No subjects found for Year ${year}, Semester ${semester}`);
      }
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.semester) params.append('semester', filter.semester);
      if (filter.department) params.append('department', filter.department);
      if (filter.utType) params.append('utType', filter.utType);

      const response = await api.get(`/results/staff?${params.toString()}`);
      
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (err) {
      console.error('Fetch results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.rollNo || !formData.subjectCode || !formData.subjectName || !formData.marksObtained) {
      alert('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.marksObtained) > parseFloat(formData.maxMarks)) {
      alert('Marks obtained cannot be greater than max marks');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/results', {
        rollNo: formData.rollNo.toUpperCase(),
        subjectCode: formData.subjectCode.toUpperCase(),
        subjectName: formData.subjectName,
        department: formData.department,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        utType: formData.utType,
        marksObtained: parseFloat(formData.marksObtained),
        maxMarks: parseFloat(formData.maxMarks)
      });
      
      alert('Result entered successfully');
      setFormData({
        ...formData,
        rollNo: '',
        subjectCode: '',
        subjectName: '',
        marksObtained: ''
      });
      fetchResults();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enter result');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If subject is selected from dropdown, auto-fill subject code and name
    if (name === 'subjectCode') {
      const selectedSubject = availableSubjects.find(s => s.code === value);
      if (selectedSubject) {
        setFormData({
          ...formData,
          subjectCode: selectedSubject.code,
          subjectName: selectedSubject.name
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/staff/dashboard', 
      key: 'dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Assigned Complaints', 
      path: '/staff/complaints', 
      key: 'complaints',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      name: 'UT Result Management', 
      path: '/staff/results', 
      key: 'results',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      name: 'MSBTE Results', 
      path: '/staff/msbte-results', 
      key: 'msbte',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {sidebarOpen && <span className="text-xl font-bold">Staff Panel</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentPage(item.key);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg border-l-4 border-indigo-400'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-900 hover:text-white transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-slate-800 transition-all duration-300"
        >
          <svg className={`w-4 h-4 transform transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">UT Result Management</h1>
            <p className="text-sm text-gray-500">Enter and manage student UT results</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Staff'}</p>
                <p className="text-xs text-gray-500">{user?.department || 'Staff Member'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Entry Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Enter UT Marks
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                    placeholder="CS2021001"
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  >
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  >
                    {[1,2,3,4,5,6].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map(subject => (
                      <option key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UT Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="utType"
                    value={formData.utType}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  >
                    <option value="UT1">UT-1</option>
                    <option value="UT2">UT-2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marks Obtained <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="marksObtained"
                    value={formData.marksObtained}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.maxMarks}
                    step="0.5"
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Result'
                )}
              </button>
            </form>
          </div>

          {/* Results Table Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Entered Results (Not Released)
              </h2>
              <button
                onClick={fetchResults}
                className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-medium hover:bg-indigo-200 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results entered yet</h3>
                <p className="text-gray-600">Start by entering UT marks using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 rounded-xl">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">UT Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{result.rollNo}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{result.subjectName}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{result.department}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{result.semester}</td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            result.utType === 'UT1' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {result.utType}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {result.marksObtained}/{result.maxMarks}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${result.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {result.percentage.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedResult(result);
                              setShowModal(true);
                            }}
                            className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-200 transition-all duration-200"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* View Result Modal */}
      {showModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Result Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Roll Number</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedResult.rollNo}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedResult.department}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Year / Semester</p>
                  <p className="text-lg font-semibold text-gray-900">Year {selectedResult.year} / Sem {selectedResult.semester}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">UT Type</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedResult.utType}</p>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm text-indigo-600 mb-1">Subject</p>
                <p className="text-lg font-semibold text-gray-900">{selectedResult.subjectName}</p>
                <p className="text-sm text-gray-600">{selectedResult.subjectCode}</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-indigo-100 mb-1">Marks Obtained</p>
                    <p className="text-3xl font-bold">{selectedResult.marksObtained} / {selectedResult.maxMarks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-indigo-100 mb-1">Percentage</p>
                    <p className="text-3xl font-bold">{selectedResult.percentage.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-300"
                    style={{ width: `${selectedResult.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                Entered on {new Date(selectedResult.createdAt).toLocaleDateString()} at {new Date(selectedResult.createdAt).toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffUTResults;
