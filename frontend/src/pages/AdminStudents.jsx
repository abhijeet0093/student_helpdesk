import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import '../styles/AdminComplaints.css';

const AdminStudents = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState({ department: '', semester: '', search: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.department) params.append('department', filter.department);
      if (filter.semester) params.append('semester', filter.semester);
      if (filter.search) params.append('search', filter.search);

      const response = await api.get(`/admin/students?${params.toString()}`);
      
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/admin/students/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResult(response.data.data);
      alert(response.data.message);
      setSelectedFile(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/admin/students/template', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_upload_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download template');
      console.error('Download error:', err);
    }
  };

  const handleDeleteStudent = async (studentId, rollNumber) => {
    if (!window.confirm(`Are you sure you want to delete student ${rollNumber}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/students/${studentId}`);
      alert('Student deleted successfully');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
      console.error('Delete error:', err);
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
            <h1>Student Management</h1>
          </div>
          <button onClick={() => logout()} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Upload Section */}
        <section style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Bulk Upload Students</h2>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadTemplate}
              style={{
                padding: '10px 20px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📥 Download Template
            </button>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📁 Select Excel File
            </label>

            {selectedFile && (
              <span style={{ fontSize: '14px', color: '#666' }}>
                Selected: {selectedFile.name}
              </span>
            )}

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  background: uploading ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : '⬆️ Upload'}
              </button>
            )}
          </div>

          {/* Upload Results */}
          {uploadResult && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Upload Results:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{uploadResult.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Success</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50' }}>{uploadResult.success.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Failed</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f44336' }}>{uploadResult.failed.length}</div>
                </div>
              </div>

              {uploadResult.failed.length > 0 && (
                <details style={{ marginTop: '12px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '8px' }}>
                    View Failed Records
                  </summary>
                  <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '12px' }}>
                    {uploadResult.failed.map((fail, idx) => (
                      <div key={idx} style={{ padding: '8px', background: 'white', marginBottom: '4px', borderRadius: '4px' }}>
                        <strong>Row {fail.row}:</strong> {fail.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '8px', fontSize: '13px' }}>
            <strong>Instructions:</strong>
            <ol style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li>Download the Excel template</li>
              <li>Fill in student details (rollNumber, enrollmentNumber, fullName are required)</li>
              <li>Upload the completed Excel file</li>
              <li>Students will be created with default password: student123</li>
            </ol>
          </div>
        </section>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select
            value={filter.department}
            onChange={(e) => setFilter({ ...filter, department: e.target.value })}
            style={{ padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="">All Departments</option>
            <option value="Computer">Computer</option>
            <option value="IT">IT</option>
            <option value="ENTC">ENTC</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

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

          <input
            type="text"
            placeholder="Search by roll no, name, or enrollment..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            style={{ flex: 1, minWidth: '250px', padding: '8px 12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>

        {/* Students Table */}
        {loading ? (
          <Loader message="Loading students..." />
        ) : (
          <div className="complaints-table-wrapper">
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
              Total Students: {students.length}
            </div>
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Enrollment No</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student._id}>
                      <td>{student.rollNumber}</td>
                      <td>{student.fullName}</td>
                      <td>{student.enrollmentNumber}</td>
                      <td>{student.department}</td>
                      <td>{student.semester}</td>
                      <td style={{ fontSize: '12px' }}>{student.email}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteStudent(student._id, student.rollNumber)}
                          style={{
                            padding: '6px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStudents;
