import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validate: () => api.post('/auth/validate'),
};

export const dashboardApi = {
  getStatus: () => api.get('/dashboard/status'),
  createInstance: (instanceName, phoneNumber) => api.post('/dashboard/create-instance', { instanceName, phoneNumber }),
  getQRCode: (instanceName) => api.get(`/dashboard/qrcode/${instanceName}`),
  getInstances: () => api.get('/dashboard/instances'),
  getInstanceStatus: (instanceName) => api.get(`/dashboard/instance/${instanceName}/status`),
  deleteInstance: (instanceName) => api.delete(`/dashboard/instance/${instanceName}`),
};

export const campaignsApi = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (formData) => api.post('/campaigns', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/campaigns/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/campaigns/${id}/status`, { status }),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

export const groupsApi = {
  getAll: (instance) => api.get('/groups', { params: { instance } }),
};

export const configApi = {
  get: () => api.get('/config'),
  update: (config) => api.put('/config', config),
};

export const logsApi = {
  getAll: (params) => api.get('/logs', { params }),
  export: (params) => api.get('/logs/export', { params }),
  getApiLogs: (params) => api.get('/logs/api', { params }),
  getApiStats: () => api.get('/logs/api/stats'),
  clearApiLogs: (days) => api.delete(`/logs/api/clear?days=${days}`),
  clearAll: () => api.delete('/logs/clear'),
  clearAllApiLogs: () => api.delete('/logs/api/clear-all'),
};

export default api;