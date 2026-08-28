import { fetchApi } from './api';


export const matchApi = {
  getMyMatches: () => fetchApi('/matches'),

  getMatchForJob: (jobId) => fetchApi(`/matches/job/${jobId}`),

  generateMatch: (jobId) => fetchApi(`/matches/job/${jobId}`, {
    method: 'POST'
  }),

  getRecommendations: (limit = 10) => fetchApi(`/recommendations?limit=${limit}`)
};