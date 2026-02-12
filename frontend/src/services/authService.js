import api from './api';

const authService = {
  // Student Registration
  registerStudent: async (data) => {
    const response = await api.post('/auth/student/register', data);
    return response.data;
  },

  // Student Login
  loginStudent: async (rollNumber, password) => {
    const response = await api.post('/auth/student/login', {
      rollNumber,
      password,
    });
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.student));
      localStorage.setItem('role', 'student');
    }
    
    return response.data;
  },

  // Admin Login
  loginAdmin: async (username, password) => {
    const response = await api.post('/auth/admin/login', {
      username,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.admin));
      localStorage.setItem('role', 'admin');
    }
    
    return response.data;
  },

  // Staff Login
  loginStaff: async (email, password) => {
    const response = await api.post('/auth/staff/login', {
      email,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.staff));
      localStorage.setItem('role', 'staff');
    }
    
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
