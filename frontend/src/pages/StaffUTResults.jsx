import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/AdminComplaints.css';

const StaffUTResults = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState({ semester: '', department: '', utType: '' });
  
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
    maxMarks: '25'
  });

  useEffect(() => {
    fetchResults();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/results/subjects');
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (err) {
      console.error('Fetch subjects error:', err);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-complaints-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/staff/dashboard')} className="back-btn">
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
        {/* Entry Form */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Enter UT Marks</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  placeholder="CS2021001"
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Subject Code *
                </label>
                <input
                  type="text"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  placeholder="CS301"
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  placeholder="Data Structures"
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="Computer">Computer</option>
                  <option value="IT">IT</option>
                  <option value="ENTC">ENTC</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                >
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  UT Type *
                </label>
                <select
                  name="utType"
                  value={formData.utType}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="UT1">UT-1</option>
                  <option value="UT2">UT-2</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Marks Obtained *
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
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Max Marks *
                </label>
                <input
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks}
                  onChange={handleInputChange}
                  min="1"
                  required
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '20px',
                padding: '12px 32px',
                background: submitting ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Result'}
            </button>
          </form>
        </section>

        {/* Results Table */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px' }}>Entered Results (Not Released)</h2>
            <button onClick={fetchResults} className="btn-primary" style={{ padding: '8px 16px' }}>
              Refresh
            </button>
          </div>

          {loading ? (
            <Loader message="Loading results..." />
          ) : (
            <div className="complaints-table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Subject</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>UT Type</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                        No results entered yet
                      </td>
                    </tr>
                  ) : (
                    results.map(result => (
                      <tr key={result._id}>
                        <td>{result.rollNo}</td>
                        <td>{result.subjectName}</td>
                        <td>{result.department}</td>
                        <td>{result.semester}</td>
                        <td><span style={{ 
                          padding: '4px 8px', 
                          background: result.utType === 'UT1' ? '#e3f2fd' : '#f3e5f5',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>{result.utType}</span></td>
                        <td>{result.marksObtained}/{result.maxMarks}</td>
                        <td>{result.percentage.toFixed(2)}%</td>
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
        </section>
      </main>
    </div>
  );
};

export default StaffUTResults;
