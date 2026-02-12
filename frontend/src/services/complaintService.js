import api from './api';

const complaintService = {
  // Create new complaint (Student)
  createComplaint: async (data) => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  // Get my complaints (Student)
  getMyComplaints: async () => {
    const response = await api.get('/complaints/my');
    return response.data;
  },

  // Get all complaints (Admin)
  getAllComplaints: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/admin/complaints${params ? '?' + params : ''}`);
    return response.data;
  },

  // Get single complaint (Admin)
  getComplaintById: async (complaintId) => {
    const response = await api.get(`/admin/complaints/${complaintId}`);
    return response.data;
  },

  // Assign complaint to staff (Admin)
  assignComplaint: async (complaintId, staffId, note) => {
    const response = await api.post(`/admin/complaints/${complaintId}/assign`, {
      staffId,
      note,
    });
    return response.data;
  },

  // Get assigned complaints (Staff)
  getAssignedComplaints: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/staff/complaints${params ? '?' + params : ''}`);
    return response.data;
  },

  // Update complaint status (Staff/Admin)
  updateComplaintStatus: async (complaintId, status, remark, isStaff = false) => {
    const endpoint = isStaff 
      ? `/staff/complaints/${complaintId}/status`
      : `/complaints/${complaintId}`;
    
    const response = await api.patch(endpoint, {
      status,
      [isStaff ? 'remark' : 'adminRemark']: remark,
    });
    return response.data;
  },
};

export default complaintService;
