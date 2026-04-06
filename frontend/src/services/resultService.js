import api from './api';

const resultService = {
  // Get my results (Student) - pass null to get all for student's year
  getMyResults: async (semester) => {
    const params = semester != null ? `?semester=${semester}` : '';
    const response = await api.get(`/results/my${params}`);
    return response.data;
  },

  // Enter result (Teacher/Admin)
  enterResult: async (data) => {
    const response = await api.post('/results', data);
    return response.data;
  },

  // Get student results by roll number (Admin)
  getStudentResults: async (rollNo) => {
    const response = await api.get(`/results/student/${rollNo}`);
    return response.data;
  },
};

export default resultService;
