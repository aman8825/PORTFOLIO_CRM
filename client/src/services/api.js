import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle global errors here
    return Promise.reject(error);
  }
);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Skills
export const getSkills = (params) => api.get('/skills', { params });
export const createSkill = (data) => api.post('/skills', data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);

// Experience
export const getExperiences = (params) => api.get('/experience', { params });
export const createExperience = (data) => api.post('/experience', data);
export const updateExperience = (id, data) => api.put(`/experience/${id}`, data);
export const deleteExperience = (id) => api.delete(`/experience/${id}`);

// Projects
export const getProjects = (params) => api.get('/projects', { params });
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Achievements
export const getAchievements = (params) => api.get('/achievements', { params });
export const createAchievement = (data) => api.post('/achievements', data);
export const updateAchievement = (id, data) => api.put(`/achievements/${id}`, data);
export const deleteAchievement = (id) => api.delete(`/achievements/${id}`);

// Resume
export const getResumes = (params) => api.get('/resume', { params });
export const createResume = (data) => api.post('/resume', data);
export const updateResume = (id, data) => api.put(`/resume/${id}`, data);
export const deleteResume = (id) => api.delete(`/resume/${id}`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const updatePassword = (data) => api.post('/settings/password', data);

// Auth
export const logout = () => api.post('/auth/logout');

// Uploads
export const uploadImage = (formData) => api.post('/uploads/image', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteImage = (publicId) => api.delete('/uploads/image', { data: { publicId } });

// AI Assistant
export const getAiStats = () => api.get('/assistant/stats');
export const getPendingQuestions = () => api.get('/assistant/questions/pending');
export const answerQuestion = (id, data) => api.post(`/assistant/questions/${id}/answer`, data);
export const getKnowledgeBase = () => api.get('/assistant/knowledge');
export const createKnowledge = (data) => api.post('/assistant/knowledge', data);
export const deleteKnowledge = (id) => api.delete(`/assistant/knowledge/${id}`);

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
