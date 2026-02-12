import api from './api';

const resultService = {
  // Get my results (Student)
  getMyResults: async () => {
    const response = await api.get('/results/my');
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
