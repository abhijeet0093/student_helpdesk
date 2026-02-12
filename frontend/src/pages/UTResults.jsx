import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resultService from '../services/resultService';
import Loader from '../components/Loader';
import '../styles/Results.css';

const UTResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (percentage >= 75) return '#4caf50'; // Green
    if (percentage >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 75) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 50) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return <Loader message="Loading results..." />;
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="error-container">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <button onClick={fetchResults} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!resultsData || resultsData.results.length === 0) {
    return (
      <div className="results-container">
        <header className="results-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            ← Back
          </button>
          <h1>UT Results</h1>
        </header>
        <div className="no-results">
          <div className="no-results-icon">📊</div>
          <h2>No Results Available</h2>
          <p>Your UT results have not been published yet.</p>
          <p className="no-results-note">Please check back later or contact your department.</p>
        </div>
      </div>
    );
  }

  const { results, summary, analysis } = resultsData;

  return (
    <div className="results-container">
      {/* Header */}
      <header className="results-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back
        </button>
        <div className="header-info">
          <h1>UT Results</h1>
          <p>{user?.fullName} • {user?.rollNumber}</p>
        </div>
        {analysis && (
          <button 
            onClick={() => navigate('/results/analysis')} 
            className="analysis-btn"
          >
            View Analysis →
          </button>
        )}
      </header>

      {/* Summary Cards */}
      {summary && (
        <section className="summary-section">
          <div className="summary-cards">
            <div className="summary-card ut1-card">
              <h3>UT-1 Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total Marks</span>
                  <span className="stat-value">
                    {summary.ut1.totalMarks} / {summary.ut1.maxMarks}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Percentage</span>
                  <span 
                    className="stat-value percentage"
                    style={{ color: getGradeColor(parseFloat(summary.ut1.percentage)) }}
                  >
                    {summary.ut1.percentage}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Subjects</span>
                  <span className="stat-value">{summary.ut1.subjectsCount}</span>
                </div>
              </div>
            </div>

            <div className="summary-card ut2-card">
              <h3>UT-2 Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total Marks</span>
                  <span className="stat-value">
                    {summary.ut2.totalMarks} / {summary.ut2.maxMarks}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Percentage</span>
                  <span 
                    className="stat-value percentage"
                    style={{ color: getGradeColor(parseFloat(summary.ut2.percentage)) }}
                  >
                    {summary.ut2.percentage}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Subjects</span>
                  <span className="stat-value">{summary.ut2.subjectsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subject-wise Results Table */}
      <section className="results-table-section">
        <h2>Subject-wise Results</h2>
        
        {/* Desktop Table */}
        <div className="results-table-wrapper desktop-table">
          <table className="results-table">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>UT-1 Marks</th>
                <th>UT-1 %</th>
                <th>UT-2 Marks</th>
                <th>UT-2 %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((subject, index) => (
                <tr key={index}>
                  <td>{subject.subjectCode}</td>
                  <td className="subject-name">{subject.subjectName}</td>
                  <td>
                    {subject.ut1 
                      ? `${subject.ut1.marksObtained} / ${subject.ut1.maxMarks}`
                      : '-'
                    }
                  </td>
                  <td>
                    {subject.ut1 && (
                      <span 
                        className="percentage-badge"
                        style={{ 
                          backgroundColor: getGradeColor(parseFloat(subject.ut1.percentage)) 
                        }}
                      >
                        {subject.ut1.percentage}%
                      </span>
                    )}
                  </td>
                  <td>
                    {subject.ut2 
                      ? `${subject.ut2.marksObtained} / ${subject.ut2.maxMarks}`
                      : '-'
                    }
                  </td>
                  <td>
                    {subject.ut2 && (
                      <span 
                        className="percentage-badge"
                        style={{ 
                          backgroundColor: getGradeColor(parseFloat(subject.ut2.percentage)) 
                        }}
                      >
                        {subject.ut2.percentage}%
                      </span>
                    )}
                  </td>
                  <td>
                    {subject.ut1 && subject.ut2 && (
                      <span className="status-text">
                        {parseFloat(subject.ut2.percentage) > parseFloat(subject.ut1.percentage) 
                          ? '📈 Improved' 
                          : parseFloat(subject.ut2.percentage) < parseFloat(subject.ut1.percentage)
                          ? '📉 Declined'
                          : '➡️ Same'
                        }
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="results-cards mobile-cards">
          {results.map((subject, index) => (
            <div key={index} className="result-card">
              <div className="result-card-header">
                <h3>{subject.subjectName}</h3>
                <span className="subject-code">{subject.subjectCode}</span>
              </div>
              <div className="result-card-body">
                <div className="ut-result">
                  <h4>UT-1</h4>
                  {subject.ut1 ? (
                    <>
                      <p className="marks">
                        {subject.ut1.marksObtained} / {subject.ut1.maxMarks}
                      </p>
                      <span 
                        className="percentage-badge"
                        style={{ 
                          backgroundColor: getGradeColor(parseFloat(subject.ut1.percentage)) 
                        }}
                      >
                        {subject.ut1.percentage}%
                      </span>
                    </>
                  ) : (
                    <p className="no-marks">Not Available</p>
                  )}
                </div>
                <div className="ut-result">
                  <h4>UT-2</h4>
                  {subject.ut2 ? (
                    <>
                      <p className="marks">
                        {subject.ut2.marksObtained} / {subject.ut2.maxMarks}
                      </p>
                      <span 
                        className="percentage-badge"
                        style={{ 
                          backgroundColor: getGradeColor(parseFloat(subject.ut2.percentage)) 
                        }}
                      >
                        {subject.ut2.percentage}%
                      </span>
                    </>
                  ) : (
                    <p className="no-marks">Not Available</p>
                  )}
                </div>
              </div>
              {subject.ut1 && subject.ut2 && (
                <div className="result-card-footer">
                  <span className="status-text">
                    {parseFloat(subject.ut2.percentage) > parseFloat(subject.ut1.percentage) 
                      ? '📈 Improved' 
                      : parseFloat(subject.ut2.percentage) < parseFloat(subject.ut1.percentage)
                      ? '📉 Declined'
                      : '➡️ Same'
                    }
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Analysis Preview */}
      {analysis && (
        <section className="quick-analysis">
          <h2>Quick Analysis</h2>
          <div className="analysis-preview">
            <div className="analysis-item">
              <span className="analysis-icon">📈</span>
              <div>
                <h4>Improved Subjects</h4>
                <p>{analysis.improved.length} subject(s)</p>
              </div>
            </div>
            <div className="analysis-item">
              <span className="analysis-icon">📉</span>
              <div>
                <h4>Need Attention</h4>
                <p>{analysis.declined.length} subject(s)</p>
              </div>
            </div>
            <div className="analysis-item">
              <span className="analysis-icon">💪</span>
              <div>
                <h4>Strong Subjects</h4>
                <p>{analysis.strongSubjects.length} subject(s)</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/results/analysis')} 
            className="view-full-analysis-btn"
          >
            View Detailed Analysis →
          </button>
        </section>
      )}
    </div>
  );
};

export default UTResults;
