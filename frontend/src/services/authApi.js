import { fetchApi } from './api';


export const authApi = {
  register: (data) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  login: (data) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  logout: () => fetchApi('/auth/logout', {
    method: 'POST'
  }),

  getMe: () => fetchApi('/auth/me')
};