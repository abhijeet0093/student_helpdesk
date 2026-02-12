import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const currentRole = authService.getUserRole();
    
    if (currentUser && currentRole) {
      setUser(currentUser);
      setRole(currentRole);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials, userRole) => {
    try {
      let response;
      
      if (userRole === 'student') {
        response = await authService.loginStudent(credentials.rollNumber, credentials.password);
        setUser(response.student);
      } else if (userRole === 'admin') {
        response = await authService.loginAdmin(credentials.username, credentials.password);
        setUser(response.admin);
      } else if (userRole === 'staff') {
        response = await authService.loginStaff(credentials.email, credentials.password);
        setUser(response.staff);
      }
      
      setRole(userRole);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
