import { fetchApi } from './api';


export const savedJobsApi = {
  getSavedJobs: () => fetchApi('/saved-jobs'),

  saveJob: (jobId) => fetchApi('/saved-jobs', {
    method: 'POST',
    body: JSON.stringify({ jobId })
  }),

  unsaveJob: (jobId) => fetchApi(`/saved-jobs/${jobId}`, {
    method: 'DELETE'
  }),

  checkSavedStatus: (jobId) => fetchApi(`/saved-jobs/${jobId}/status`)
};