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

  // `idToken` comes from the Google popup; the server verifies it before it will
  // create a session. `role` is only used if this Google account is brand new.
  google: ({ idToken, role }) => fetchApi('/auth/google', {
    method: 'POST',
    body: JSON.stringify(role ? { idToken, role } : { idToken })
  }),

  logout: () => fetchApi('/auth/logout', {
    method: 'POST'
  }),

  getMe: () => fetchApi('/auth/me')
};