export const API_URL = '/api';

export class ApiError extends Error {



  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});

  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only add content-type json if it's not FormData (which multer needs boundary for)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new ApiError(response.status, 'Invalid JSON response from server');
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error || data?.message || 'Something went wrong',
      data
    );
  }

  if (data && typeof data === 'object' && 'success' in data && !data.success) {
    throw new ApiError(response.status, data.error || data.message || 'Operation failed', data);
  }

  return data.data !== undefined ? data.data : data;
}