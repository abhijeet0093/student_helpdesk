import api from './api';

const resultService = {
  // Get my UT results (Student)
  getMyResults: async (semester) => {
    const params = semester != null ? `?semester=${semester}` : '';
    const response = await api.get(`/results/my${params}`);
    return response.data;
  },

  // Get my approved MSBTE results (Student)
  getMyMSBTEResults: async () => {
    const response = await api.get('/results/msbte');
    return response.data;
  },

  // Enter UT result (Staff/Admin)
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
