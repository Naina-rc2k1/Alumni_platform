import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password, role) => 
    api.post('/auth/login', { email, password, role }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile', profileData),
  
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) => 
    api.post('/auth/reset-password', { token, password }),
};

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

export default api;
