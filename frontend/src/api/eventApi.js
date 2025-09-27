import api from './authApi';

export const eventApi = {
  getAll: (params = {}) => 
    api.get('/events', { params }),
  
  getById: (id) => 
    api.get(`/events/${id}`),
  
  create: (eventData) => 
    api.post('/events', eventData),
  
  update: (id, eventData) => 
    api.put(`/events/${id}`, eventData),
  
  delete: (id) => 
    api.delete(`/events/${id}`),
  
  register: (eventId) => 
    api.post(`/events/${eventId}/register`),
  
  unregister: (eventId) => 
    api.delete(`/events/${eventId}/register`),
};
