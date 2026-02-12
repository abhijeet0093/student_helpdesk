import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import resultService from '../services/resultService';
import Loader from '../components/Loader';
import '../styles/Results.css';

const ResultAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await resultService.getMyResults();
      
      if (response.success && response.data.analysis) {
        setAnalysisData(response.data.analysis);
      } else {
        setError('Analysis not available. Both UT-1 and UT-2 results are required.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis');
      console.error('Fetch analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return '#4caf50';
      case 'declining':
        return '#f44336';
      case 'stable':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  if (loading) {
    return <Loader message="Analyzing performance..." />;
  }

  if (error) {
    return (
      <div className="results-container">
        <header className="results-header">
          <button onClick={() => navigate('/results')} className="back-btn">
            ← Back to Results
          </button>
          <h1>Performance Analysis</h1>
        </header>
        <div className="error-container">
          <h2>Analysis Not Available</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/results')} className="retry-btn">
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="results-container">
        <header className="results-header">
          <button onClick={() => navigate('/results')} className="back-btn">
            ← Back to Results
          </button>
          <h1>Performance Analysis</h1>
        </header>
        <div className="no-results">
          <h2>Analysis Not Available</h2>
          <p>Complete both UT-1 and UT-2 to see performance analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container analysis-page">
      {/* Header */}
      <header className="results-header">
        <button onClick={() => navigate('/results')} className="back-btn">
          ← Back to Results
        </button>
        <div className="header-info">
          <h1>Performance Analysis</h1>
          <p>{user?.fullName} • {user?.rollNumber}</p>
        </div>
      </header>

      {/* Overall Trend */}
      <section className="overall-trend-section">
        <div 
          className="trend-card"
          style={{ borderLeftColor: getTrendColor(analysisData.overallTrend) }}
        >
          <div className="trend-icon" style={{ color: getTrendColor(analysisData.overallTrend) }}>
            {getTrendIcon(analysisData.overallTrend)}
          </div>
          <div className="trend-content">
            <h2>Overall Performance Trend</h2>
            <p className="trend-label" style={{ color: getTrendColor(analysisData.overallTrend) }}>
              {analysisData.overallTrend.charAt(0).toUpperCase() + analysisData.overallTrend.slice(1)}
            </p>
            {analysisData.textSummary && (
              <p className="trend-summary">{analysisData.textSummary}</p>
            )}
          </div>
        </div>
      </section>

      {/* Performance Categories */}
      <section className="performance-categories">
        <div className="category-grid">
          {/* Improved Subjects */}
          <div className="category-card improved-card">
            <div className="category-header">
              <span className="category-icon">📈</span>
              <h3>Improved Subjects</h3>
              <span className="category-count">{analysisData.improved.length}</span>
            </div>
            <div className="category-body">
              {analysisData.improved.length > 0 ? (
                <ul className="subject-list">
                  {analysisData.improved.map((subject, index) => (
                    <li key={index} className="subject-item">
                      <div className="subject-info">
                        <span className="subject-name">{subject.subjectName}</span>
                        <span className="subject-change positive">
                          +{subject.difference}%
                        </span>
                      </div>
                      <div className="subject-marks">
                        <span className="ut-mark">UT-1: {subject.ut1Percentage}%</span>
                        <span className="arrow">→</span>
                        <span className="ut-mark">UT-2: {subject.ut2Percentage}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">No subjects improved significantly</p>
              )}
            </div>
          </div>

          {/* Declined Subjects */}
          <div className="category-card declined-card">
            <div className="category-header">
              <span className="category-icon">📉</span>
              <h3>Need Attention</h3>
              <span className="category-count">{analysisData.declined.length}</span>
            </div>
            <div className="category-body">
              {analysisData.declined.length > 0 ? (
                <ul className="subject-list">
                  {analysisData.declined.map((subject, index) => (
                    <li key={index} className="subject-item">
                      <div className="subject-info">
                        <span className="subject-name">{subject.subjectName}</span>
                        <span className="subject-change negative">
                          {subject.difference}%
                        </span>
                      </div>
                      <div className="subject-marks">
                        <span className="ut-mark">UT-1: {subject.ut1Percentage}%</span>
                        <span className="arrow">→</span>
                        <span className="ut-mark">UT-2: {subject.ut2Percentage}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">Great! No subjects declined</p>
              )}
            </div>
          </div>

          {/* Strong Subjects */}
          <div className="category-card strong-card">
            <div className="category-header">
              <span className="category-icon">💪</span>
              <h3>Strong Subjects</h3>
              <span className="category-count">{analysisData.strongSubjects.length}</span>
            </div>
            <div className="category-body">
              {analysisData.strongSubjects.length > 0 ? (
                <ul className="subject-list">
                  {analysisData.strongSubjects.map((subject, index) => (
                    <li key={index} className="subject-item">
                      <div className="subject-info">
                        <span className="subject-name">{subject.subjectName}</span>
                        <span className="subject-percentage strong">
                          {subject.percentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">Work harder to build strong subjects</p>
              )}
            </div>
          </div>

          {/* Weak Subjects */}
          <div className="category-card weak-card">
            <div className="category-header">
              <span className="category-icon">⚠️</span>
              <h3>Weak Subjects</h3>
              <span className="category-count">{analysisData.weakSubjects.length}</span>
            </div>
            <div className="category-body">
              {analysisData.weakSubjects.length > 0 ? (
                <ul className="subject-list">
                  {analysisData.weakSubjects.map((subject, index) => (
                    <li key={index} className="subject-item">
                      <div className="subject-info">
                        <span className="subject-name">{subject.subjectName}</span>
                        <span className="subject-percentage weak">
                          {subject.percentage}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-items">Excellent! No weak subjects</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI-Generated Feedback */}
      <section className="feedback-section">
        <h2>📝 Personalized Feedback & Guidance</h2>
        <div className="feedback-cards">
          {analysisData.feedback && analysisData.feedback.length > 0 ? (
            analysisData.feedback.map((feedback, index) => (
              <div key={index} className="feedback-card">
                <div className="feedback-icon">💡</div>
                <p>{feedback}</p>
              </div>
            ))
          ) : (
            <div className="feedback-card">
              <p>Keep up the good work! Continue your consistent effort.</p>
            </div>
          )}
        </div>
      </section>

      {/* Study Tips */}
      <section className="tips-section">
        <h2>📚 Exam Preparation Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <h3>Focus Areas</h3>
            <p>
              {analysisData.weakSubjects.length > 0
                ? `Prioritize: ${analysisData.weakSubjects.map(s => s.subjectName).join(', ')}`
                : 'Maintain balance across all subjects'}
            </p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">⏰</div>
            <h3>Time Management</h3>
            <p>Allocate more study time to subjects where you need improvement</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">👥</div>
            <h3>Seek Help</h3>
            <p>Don't hesitate to ask teachers or peers for help in difficult topics</p>
          </div>
          <div className="tip-card">
            <div className="tip-icon">📝</div>
            <h3>Practice</h3>
            <p>Solve previous year papers and practice problems regularly</p>
          </div>
        </div>
      </section>

      {/* Action Button */}
      <section className="action-section">
        <button 
          onClick={() => navigate('/ai-chat')} 
          className="ai-help-btn"
        >
          🤖 Get AI Study Assistance
        </button>
      </section>
    </div>
  );
};

export default ResultAnalysis;
