import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resultService from '../services/resultService';
import Loader from '../components/Loader';

const UTResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await resultService.getMyResults();
      
      if (response.success) {
        setResultsData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load results');
      console.error('Fetch results error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 75) return 'from-green-500 to-emerald-600';
    if (percentage >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 75) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
        <Loader message="Loading results..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!resultsData || resultsData.results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h2>
            <p className="text-gray-600 mb-2">Your UT results have not been published yet.</p>
            <p className="text-sm text-gray-500">Please check back later or contact your department.</p>
          </div>
        </div>
      </div>
    );
  }

  const { results, summary, analysis } = resultsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">UT Results</h1>
            <p className="text-gray-600 mt-1">{user?.fullName} • {user?.rollNumber}</p>
          </div>
          
          {analysis && (
            <button
              onClick={() => navigate('/results/analysis')}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analysis
            </button>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* UT-1 Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">UT-1 Summary</h3>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Total Marks</span>
                  <span className="text-2xl font-bold">{summary.ut1.totalMarks} / {summary.ut1.maxMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Percentage</span>
                  <span className="text-3xl font-bold">{summary.ut1.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-100">Subjects</span>
                  <span className="text-xl font-semibold">{summary.ut1.subjectsCount}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <span className="text-sm text-indigo-100">{getGradeLabel(parseFloat(summary.ut1.percentage))}</span>
                </div>
              </div>
            </div>

            {/* UT-2 Summary */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">UT-2 Summary</h3>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total Marks</span>
                  <span className="text-2xl font-bold">{summary.ut2.totalMarks} / {summary.ut2.maxMarks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Percentage</span>
                  <span className="text-3xl font-bold">{summary.ut2.percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Subjects</span>
                  <span className="text-xl font-semibold">{summary.ut2.subjectsCount}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <span className="text-sm text-purple-100">{getGradeLabel(parseFloat(summary.ut2.percentage))}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subject-wise Results */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject-wise Results</h2>
          
          <div className="space-y-4">
            {results.map((subject, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{subject.subjectName}</h3>
                    <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                  </div>
                  {subject.ut1 && subject.ut2 && (
                    <span className="text-sm font-medium text-gray-600">
                      {parseFloat(subject.ut2.percentage) > parseFloat(subject.ut1.percentage) 
                        ? '📈 Improved' 
                        : parseFloat(subject.ut2.percentage) < parseFloat(subject.ut1.percentage)
                        ? '📉 Declined'
                        : '➡️ Same'
                      }
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* UT-1 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">UT-1</span>
                      {subject.ut1 && (
                        <span className="text-sm text-gray-600">
                          {subject.ut1.marksObtained} / {subject.ut1.maxMarks}
                        </span>
                      )}
                    </div>
                    {subject.ut1 ? (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`bg-gradient-to-r ${getGradeColor(parseFloat(subject.ut1.percentage))} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${subject.ut1.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{subject.ut1.percentage}%</span>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Not Available</p>
                    )}
                  </div>

                  {/* UT-2 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">UT-2</span>
                      {subject.ut2 && (
                        <span className="text-sm text-gray-600">
                          {subject.ut2.marksObtained} / {subject.ut2.maxMarks}
                        </span>
                      )}
                    </div>
                    {subject.ut2 ? (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`bg-gradient-to-r ${getGradeColor(parseFloat(subject.ut2.percentage))} h-3 rounded-full transition-all duration-500`}
                            style={{ width: `${subject.ut2.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{subject.ut2.percentage}%</span>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Not Available</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Analysis */}
        {analysis && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📈</span>
                  <h4 className="font-bold text-gray-900">Improved</h4>
                </div>
                <p className="text-2xl font-bold text-green-600">{analysis.improved.length}</p>
                <p className="text-sm text-gray-600">subject(s)</p>
              </div>

              <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">📉</span>
                  <h4 className="font-bold text-gray-900">Need Attention</h4>
                </div>
                <p className="text-2xl font-bold text-red-600">{analysis.declined.length}</p>
                <p className="text-sm text-gray-600">subject(s)</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">💪</span>
                  <h4 className="font-bold text-gray-900">Strong Subjects</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">{analysis.strongSubjects.length}</p>
                <p className="text-sm text-gray-600">subject(s)</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/results/analysis')}
              className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              View Detailed Analysis →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UTResults;
