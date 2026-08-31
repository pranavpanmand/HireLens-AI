import { fetchApi } from './api';

export const profileApi = {
  getProfile: () => fetchApi('/profile'),
  updateBasicInfo: (data) => fetchApi('/profile/basic-info', { method: 'PUT', body: JSON.stringify(data) }),
  updatePreferences: (data) => fetchApi('/profile/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  
  updateEducation: (education) => fetchApi('/profile/education', { method: 'PUT', body: JSON.stringify({ education }) }),
  updateExperience: (experience) => fetchApi('/profile/experience', { method: 'PUT', body: JSON.stringify({ experience }) }),
  updateProjects: (projects) => fetchApi('/profile/projects', { method: 'PUT', body: JSON.stringify({ projects }) }),

  updateSkills: (skills) => fetchApi('/profile/skills', { method: 'PUT', body: JSON.stringify({ skills }) }),
  updateSummary: (summary) => fetchApi('/profile/summary', { method: 'PUT', body: JSON.stringify({ summary }) }),
  updateLanguages: (languages) => fetchApi('/profile/languages', { method: 'PUT', body: JSON.stringify({ languages }) }),
  updateAccomplishments: (achievements) => fetchApi('/profile/achievements', { method: 'PUT', body: JSON.stringify({ achievements }) }),

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
