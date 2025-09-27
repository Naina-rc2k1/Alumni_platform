import api from './authApi';

export const mentorshipApi = {
  getAll: (params = {}) => 
    api.get('/mentorship', { params }),
  
  getById: (id) => 
    api.get(`/mentorship/${id}`),
  
  create: (mentorshipData) => 
    api.post('/mentorship', mentorshipData),
  
  update: (id, mentorshipData) => 
    api.put(`/mentorship/${id}`, mentorshipData),
  
  delete: (id) => 
    api.delete(`/mentorship/${id}`),
  
  apply: (mentorshipId) => 
    api.post(`/mentorship/${mentorshipId}/apply`),
  
  getApplications: (mentorshipId) => 
    api.get(`/mentorship/${mentorshipId}/applications`),
  
  approveApplication: (mentorshipId, applicationId) => 
    api.put(`/mentorship/${mentorshipId}/applications/${applicationId}/approve`),
  
  rejectApplication: (mentorshipId, applicationId) => 
    api.put(`/mentorship/${mentorshipId}/applications/${applicationId}/reject`),
};
