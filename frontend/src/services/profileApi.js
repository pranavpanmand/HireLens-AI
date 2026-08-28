import { fetchApi } from './api';

export const profileApi = {
  getProfile: () => fetchApi('/profile'),
  updateBasicInfo: (data) => fetchApi('/profile/basic', { method: 'PUT', body: JSON.stringify(data) }),
  updatePreferences: (data) => fetchApi('/profile/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  
  addEducation: (data) => fetchApi('/profile/education', { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (id, data) => fetchApi(`/profile/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEducation: (id) => fetchApi(`/profile/education/${id}`, { method: 'DELETE' }),

  addExperience: (data) => fetchApi('/profile/experience', { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (id, data) => fetchApi(`/profile/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperience: (id) => fetchApi(`/profile/experience/${id}`, { method: 'DELETE' }),

  addProject: (data) => fetchApi('/profile/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => fetchApi(`/profile/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => fetchApi(`/profile/projects/${id}`, { method: 'DELETE' }),

  updateSkills: (skills) => fetchApi('/profile/skills', { method: 'PUT', body: JSON.stringify({ skills }) }),

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    // Use the raw fetchApi call pattern without JSON.stringify
    const token = localStorage.getItem('token');
    const response = await fetch('/api/profile/photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload photo');
    }
    return response.json();
  },

  deletePhoto: () => fetchApi('/profile/photo', { method: 'DELETE' }),
};
