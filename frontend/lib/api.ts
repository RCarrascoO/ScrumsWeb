import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

export const authApi = {
  login: async (credentials: any) => {
    // El backend espera email y password como query parameters
    return apiClient.post(`/auth/login?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`);
  },
  register: async (userData: any) => {
    return apiClient.post('/auth/register', userData);
  },
  me: async () => {
    return apiClient.get('/users/me');
  }
};

export const usersApi = {
  getAll: async () => apiClient.get('/users/'),
};

export const projectsApi = {
  getAll: async () => apiClient.get('/projects/'),
  getOne: async (id: string) => apiClient.get(`/projects/${id}`),
  create: async (data: any) => apiClient.post('/projects/', data),
  assignUser: async (id: string, email: string) => apiClient.post(`/projects/${id}/assign-user?email=${encodeURIComponent(email)}`),
};

export const sprintsApi = {
  getAll: async (projectId: string) => apiClient.get(`/sprints/project/${projectId}`),
  getOne: async (id: string) => apiClient.get(`/sprints/${id}`),
  create: async (projectId: string, data: any) => apiClient.post(`/sprints/?project_id=${projectId}`, data),
};

export const tasksApi = {
  getAll: async (sprintId: string) => apiClient.get(`/tasks/sprint/${sprintId}`),
  create: async (sprintId: string, data: any) => apiClient.post(`/tasks/?sprint_id=${sprintId}`, data),
  update: async (taskId: string, data: any) => apiClient.put(`/tasks/${taskId}`, data),
  assignEmail: async (taskId: string, email: string) => apiClient.post(`/tasks/${taskId}/assign?email=${encodeURIComponent(email)}`),
};

export const teamsApi = {
  getAll: async () => apiClient.get('/teams/'), // Suponiendo listado general o crear
  create: async (data: any) => apiClient.post('/teams/', data),
};
