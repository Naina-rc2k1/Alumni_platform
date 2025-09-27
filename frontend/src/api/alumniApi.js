import api from './authApi';

export const alumniApi = {
  getAll: (params = {}) => 
    api.get('/alumni', { params }),
  
  getById: (id) => 
    api.get(`/alumni/${id}`),
  
  create: (alumniData) => 
    api.post('/alumni', alumniData),
  
  update: (id, alumniData) => 
    api.put(`/alumni/${id}`, alumniData),
  
  delete: (id) => 
    api.delete(`/alumni/${id}`),
  
  search: (query) => 
    api.get('/alumni/search', { params: { q: query } }),
};
