import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Auth API calls
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Users API calls
export const users = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Library API calls
export const library = {
  getAll: () => api.get('/library'),
  getById: (id) => api.get(`/library/${id}`),
  create: (data) => api.post('/library', data),
  update: (id, data) => api.put(`/library/${id}`, data),
  delete: (id) => api.delete(`/library/${id}`),
};

// Jobs API calls
export const jobs = {
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Academic API calls
export const academic = {
  getAllCourses: () => api.get('/academic/courses'),
  getCourseById: (id) => api.get(`/academic/courses/${id}`),
  createCourse: (data) => api.post('/academic/courses', data),
  updateCourse: (id, data) => api.put(`/academic/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/academic/courses/${id}`),
};

// Mentorship API calls
export const mentorship = {
  getAllMentors: () => api.get('/mentorship/mentors'),
  getMentorById: (id) => api.get(`/mentorship/mentors/${id}`),
  createMentor: (data) => api.post('/mentorship/mentors', data),
  updateMentor: (id, data) => api.put(`/mentorship/mentors/${id}`, data),
  deleteMentor: (id) => api.delete(`/mentorship/mentors/${id}`),
};

// Settings API calls
export const settings = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api; 