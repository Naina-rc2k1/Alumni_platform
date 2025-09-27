import api from './authApi';

export const studentApi = {
  getAll: (params = {}) => 
    api.get('/students', { params }),
  
  getById: (id) => 
    api.get(`/students/${id}`),
  
  create: (studentData) => 
    api.post('/students', studentData),
  
  update: (id, studentData) => 
    api.put(`/students/${id}`, studentData),
  
  delete: (id) => 
    api.delete(`/students/${id}`),
};
