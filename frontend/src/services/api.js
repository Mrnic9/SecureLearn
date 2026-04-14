const API_URL = 'http://localhost:5000/api';

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth endpoints
export const authAPI = {
  register: (email, password, firstName, lastName) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  verify: () =>
    fetch(`${API_URL}/auth/verify`, {
      headers: getAuthHeader()
    }).then(r => r.json())
};

// User endpoints
export const userAPI = {
  getMe: () =>
    fetch(`${API_URL}/users/me`, {
      headers: getAuthHeader()
    }).then(r => r.json()),

  updateProfile: (firstName, lastName) =>
    fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName })
    }).then(r => r.json()),

  listUsers: () =>
    fetch(`${API_URL}/users`, {
      headers: getAuthHeader()
    }).then(r => r.json())
};

// Course endpoints
export const courseAPI = {
  list: () =>
    fetch(`${API_URL}/courses`).then(r => r.json()),

  getById: (id) =>
    fetch(`${API_URL}/courses/${id}`).then(r => r.json()),

  create: (courseData) =>
    fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    }).then(r => r.json()),

  enroll: (courseId) =>
    fetch(`${API_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeader()
    }).then(r => r.json()),

  getProgress: (courseId) =>
    fetch(`${API_URL}/courses/${courseId}/progress`, {
      headers: getAuthHeader()
    }).then(r => r.json())
};
