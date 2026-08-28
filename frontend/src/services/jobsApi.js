import { fetchApi } from './api';

export const jobsApi = {
  search: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location && filters.location !== 'All') params.append('location', filters.location);
    if (filters.source && filters.source !== 'All') params.append('source', filters.source);
    if (filters.workMode && filters.workMode !== 'All') params.append('workMode', filters.workMode);
    if (filters.jobType && filters.jobType !== 'All') params.append('jobType', filters.jobType);
    if (filters.experienceLevel && filters.experienceLevel !== 'All') params.append('experienceLevel', filters.experienceLevel);
    if (filters.minSalary) params.append('minSalary', filters.minSalary);
    if (filters.maxSalary) params.append('maxSalary', filters.maxSalary);
    if (filters.skills && filters.skills.length > 0) params.append('skills', filters.skills.join(','));
    if (filters.postedWithin) params.append('postedWithin', filters.postedWithin);
    if (filters.sort) params.append('sort', filters.sort);
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 10).toString());
    return fetchApi(`/jobs?${params.toString()}`);
  },

  getById: (id) =>
  fetchApi(`/jobs/${id}`),

  fetchExternal: (what, where) => {
    const params = new URLSearchParams();
    if (what) params.append('what', what);
    if (where) params.append('where', where);
    return fetchApi(`/jobs/external?${params.toString()}`);
  },

  // Recruiter endpoints
  getMyPostings: () =>
  fetchApi('/recruiter/jobs'),

  createPosting: (data) =>
  fetchApi('/recruiter/jobs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updatePosting: (id, data) =>
  fetchApi(`/recruiter/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deletePosting: (id) =>
  fetchApi(`/recruiter/jobs/${id}`, {
    method: 'DELETE'
  })
};