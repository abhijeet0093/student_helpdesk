import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';

const AdminUTResults = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ semester: '', department: '', utType: '', isReleased: '' });
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseData, setReleaseData] = useState({
    semester: '',
    utType: '',
    department: ''
  });

  useEffect(() => {
    fetchResults();
  }, [filter]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.semester) params.append('semester', filter.semester);
      if (filter.department) params.append('department', filter.department);
      if (filter.utType) params.append('utType', filter.utType);
      if (filter.isReleased) params.append('isReleased', filter.isReleased);

      const response = await api.get(`/results/admin?${params.toString()}`);
      
      if (response.data.success) {
        setResults(response.data.data.results);
        setStatistics(response.data.data.statistics);
      }
    } catch (err) {
      console.error('Fetch results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseResults = async () => {
    if (!releaseData.semester || !releaseData.utType) {
      alert('Please select semester and UT type');
      return;
    }

    if (!window.confirm(`Are you sure you want to release ${releaseData.utType} results for Semester ${releaseData.semester}${releaseData.department ? ` - ${releaseData.department}` : ' (All Departments)'}?`)) {
      return;
    }

    try {
      const response = await api.put('/results/release', {
        semester: parseInt(releaseData.semester),
        utType: releaseData.utType,
        department: releaseData.department || undefined
      });

      alert(response.data.message);
      setShowReleaseModal(false);
      setReleaseData({ semester: '', utType: '', department: '' });
      fetchResults();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release results');
      console.error('Release error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UT Results Management</h1>
              <p className="text-sm text-gray-500">View and manage student results</p>
            </div>
          </div>
          <button 
            onClick={() => logout()} 
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 hover:scale-105"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Total Results</h3>
              <p className="text-3xl font-bold text-indigo-600">{statistics.total}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Released</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.released}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Draft</h3>
              <p className="text-3xl font-bold text-orange-600">{statistics.draft}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">1</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">UT-1</h3>
              <p className="text-3xl font-bold text-blue-600">{statistics.ut1}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">2</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">UT-2</h3>
              <p className="text-3xl font-bold text-purple-600">{statistics.ut2}</p>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={filter.semester}
                onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
              >
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>

              <select
                value={filter.utType}
                onChange={(e) => setFilter({ ...filter, utType: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
              >
                <option value="">All UT Types</option>
                <option value="UT1">UT-1</option>
                <option value="UT2">UT-2</option>
              </select>

              <select
                value={filter.isReleased}
                onChange={(e) => setFilter({ ...filter, isReleased: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
              >
                <option value="">All Status</option>
                <option value="true">Released</option>
                <option value="false">Draft</option>
              </select>
            </div>

            <button
              onClick={() => setShowReleaseModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Release Results
            </button>
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader message="Loading results..." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Roll No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dept</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Sem</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">UT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Marks</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">%</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 text-lg font-medium">No results found</p>
                          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results.map((result, index) => (
                      <tr key={result._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{result.rollNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{result.subjectName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{result.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{result.semester}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.utType === 'UT1' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {result.utType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {result.marksObtained}/{result.maxMarks}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                          {result.percentage.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.isPublished 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {result.isPublished ? 'Released' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Release Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Release Results</h2>
              <button 
                onClick={() => setShowReleaseModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-gray-600 text-sm">
                Select criteria to release results. All matching unreleased results will be made visible to students.
              </p>

              {/* Semester */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={releaseData.semester}
                  onChange={(e) => setReleaseData({ ...releaseData, semester: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* UT Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  UT Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={releaseData.utType}
                  onChange={(e) => setReleaseData({ ...releaseData, utType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
                >
                  <option value="">Select UT Type</option>
                  <option value="UT1">UT-1</option>
                  <option value="UT2">UT-2</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <select
                  value={releaseData.department}
                  onChange={(e) => setReleaseData({ ...releaseData, department: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="Computer">Computer</option>
                  <option value="IT">IT</option>
                  <option value="ENTC">ENTC</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowReleaseModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReleaseResults}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUTResults;
