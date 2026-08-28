import { fetchApi } from './api';


export const resumeApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    return fetchApi('/resumes/upload', {
      method: 'POST',
      body: formData
    });
  },

  getMyResumes: () => fetchApi('/resumes'),

  getById: (id) => fetchApi(`/resumes/${id}`),

  delete: (id) => fetchApi(`/resumes/${id}`, { method: 'DELETE' }),

  setPrimary: (id) => fetchApi(`/resumes/${id}/primary`, { method: 'PUT' })
};