import { fetchApi } from './api';

export const applicationsApi = {
  apply: (jobId) => fetchApi(`/applications/job/${jobId}`, { method: 'POST' }),
  getMyApplications: () => fetchApi('/applications/my'),
  getJobApplicants: (jobId) => fetchApi(`/applications/job/${jobId}`),
  updateStatus: (applicationId, status) => fetchApi(`/applications/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  })
};
