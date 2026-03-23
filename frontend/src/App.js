import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CreateComplaint from './pages/CreateComplaint';
import MyComplaints from './pages/MyComplaints';
import AIChat from './pages/AIChat';
import UTResults from './pages/UTResults';
import ResultAnalysis from './pages/ResultAnalysis';
import StudentCorner from './pages/StudentCorner';
import CreatePost from './pages/CreatePost';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaints from './pages/AdminComplaints';
import AdminUTResults from './pages/AdminUTResults';
import AdminStudents from './pages/AdminStudents';
import AdminStaff from './pages/AdminStaff';
import StaffDashboard from './pages/StaffDashboard';
import StaffComplaints from './pages/StaffComplaints';
import StaffUTResults from './pages/StaffUTResults';


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Student Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/complaints/new" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CreateComplaint />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/complaints" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyComplaints />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ai-chat" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AIChat />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/results" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <UTResults />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/results/analysis" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ResultAnalysis />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/corner" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCorner />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/corner/create" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/complaints" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/results" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUTResults />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStudents />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/staff" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStaff />
              </ProtectedRoute>
            } 
          />
          
          {/* Staff Routes */}
          <Route 
            path="/staff/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/staff/complaints" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffComplaints />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/staff/results" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffUTResults />
              </ProtectedRoute>
            } 
          />
          
          {/* Unauthorized page */}
          <Route 
            path="/unauthorized" 
            element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
              </div>
            } 
          />
          
          {/* 404 page */}
          <Route 
            path="*" 
            element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
              </div>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
