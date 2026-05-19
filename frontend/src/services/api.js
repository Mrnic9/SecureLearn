import securityService from './security';

const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Error: ${response.status}`);
  }
  return data;
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('auth_token');
  const csrfToken = sessionStorage.getItem('csrf_token') || securityService.generateCSRFToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  return headers;
};

// Auth endpoints
export const authAPI = {
  register: async (email, password, firstName, lastName) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email, password, firstName, lastName })
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  verify: async () => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// User endpoints
export const userAPI = {
  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  updateProfile: async (firstName, lastName) => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ firstName, lastName })
    });
    return handleResponse(response);
  },

  listUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  updateUser: async (id, data) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};

// Course endpoints
export const courseAPI = {
  // Cursos publicados (público)
  list: async () => {
    const response = await fetch(`${API_URL}/courses`);
    return handleResponse(response);
  },

  // Todos los cursos incluyendo borradores (admin/instructor)
  listAll: async () => {
    const response = await fetch(`${API_URL}/courses/all`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`);
    return handleResponse(response);
  },

  create: async (courseData) => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  update: async (id, courseData) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  togglePublish: async (id, publish) => {
    const response = await fetch(`${API_URL}/courses/${id}/publish`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ publish })
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  enroll: async (courseId) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse(response);
  },

  getProgress: async (courseId) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/progress`, {
      headers: getAuthHeader()
    });
    return handleResponse(response);
  }
};
