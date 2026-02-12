import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/AdminComplaints.css';

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
    <div className="admin-complaints-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
              ← Back
            </button>
            <h1>UT Results Management</h1>
          </div>
          <button onClick={() => logout()} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Statistics */}
        {statistics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '30px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Results</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>{statistics.total}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Released</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#4caf50' }}>{statistics.released}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Draft</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff9800' }}>{statistics.draft}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>UT-1</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#2196f3' }}>{statistics.ut1}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>UT-2</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#9c27b0' }}>{statistics.ut2}</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={filter.semester}
              onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
              style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>

            <select
              value={filter.utType}
              onChange={(e) => setFilter({ ...filter, utType: e.target.value })}
              style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">All UT Types</option>
              <option value="UT1">UT-1</option>
              <option value="UT2">UT-2</option>
            </select>

            <select
              value={filter.isReleased}
              onChange={(e) => setFilter({ ...filter, isReleased: e.target.value })}
              style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="">All Status</option>
              <option value="true">Released</option>
              <option value="false">Draft</option>
            </select>
          </div>

          <button
            onClick={() => setShowReleaseModal(true)}
            style={{
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Release Results
          </button>
        </div>

        {/* Results Table */}
        {loading ? (
          <Loader message="Loading results..." />
        ) : (
          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Subject</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>UT</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                      No results found
                    </td>
                  </tr>
                ) : (
                  results.map(result => (
                    <tr key={result._id}>
                      <td>{result.rollNo}</td>
                      <td>{result.subjectName}</td>
                      <td>{result.department}</td>
                      <td>{result.semester}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          background: result.utType === 'UT1' ? '#e3f2fd' : '#f3e5f5',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {result.utType}
                        </span>
                      </td>
                      <td>{result.marksObtained}/{result.maxMarks}</td>
                      <td>{result.percentage.toFixed(1)}%</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          background: result.isReleased ? '#e8f5e9' : '#fff3e0',
                          color: result.isReleased ? '#2e7d32' : '#e65100',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {result.isReleased ? 'Released' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Release Modal */}
      {showReleaseModal && (
        <div className="modal-overlay" onClick={() => setShowReleaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Release Results</h2>
              <button className="close-btn" onClick={() => setShowReleaseModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Select criteria to release results. All matching unreleased results will be made visible to students.
              </p>

              <div className="form-group">
                <label>Semester *</label>
                <select
                  value={releaseData.semester}
                  onChange={(e) => setReleaseData({ ...releaseData, semester: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>UT Type *</label>
                <select
                  value={releaseData.utType}
                  onChange={(e) => setReleaseData({ ...releaseData, utType: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select UT Type</option>
                  <option value="UT1">UT-1</option>
                  <option value="UT2">UT-2</option>
                </select>
              </div>

              <div className="form-group">
                <label>Department (Optional)</label>
                <select
                  value={releaseData.department}
                  onChange={(e) => setReleaseData({ ...releaseData, department: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Departments</option>
                  <option value="Computer">Computer</option>
                  <option value="IT">IT</option>
                  <option value="ENTC">ENTC</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <button className="btn-primary" onClick={handleReleaseResults}>
                Release Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUTResults;
