import api from './api';

const dashboardService = {
  // Get student dashboard data
  getDashboardData: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },
};

export default dashboardService;
