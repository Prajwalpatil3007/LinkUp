import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linkup_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateMe: (data) => api.put('/users/me', data),
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateMyProfile: (data) => api.put('/users/profile/me', data)
};

export const opportunityAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  apply: (id, data) => api.post(`/opportunities/${id}/apply`, data),
  getApplications: (id) => api.get(`/opportunities/${id}/applications`)
};

export const assistanceAPI = {
  getAll: (params) => api.get('/assistance-requests', { params }),
  getById: (id) => api.get(`/assistance-requests/${id}`),
  create: (data) => api.post('/assistance-requests', data)
};

export const applicationAPI = {
  getMyApplications: () => api.get('/applications/me'),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdraw: (id) => api.put(`/applications/${id}/withdraw`)
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  requestJoin: (id, data) => api.post(`/projects/${id}/join`, data),
  handleJoinRequest: (id, requestId, action) => api.put(`/projects/${id}/requests/${requestId}`, { action })
};

export const communityAPI = {
  getAll: (params) => api.get('/communities', { params }),
  getById: (id) => api.get(`/communities/${id}`),
  create: (data) => api.post('/communities', data),
  join: (id) => api.post(`/communities/${id}/join`),
  leave: (id) => api.post(`/communities/${id}/leave`),
  getPosts: (id) => api.get(`/communities/${id}/posts`),
  createPost: (id, data) => api.post(`/communities/${id}/posts`, data),
  likePost: (postId) => api.post(`/communities/posts/${postId}/like`),
  addComment: (postId, data) => api.post(`/communities/posts/${postId}/comments`, data)
};

export const organizationAPI = {
  getAll: (params) => api.get('/organizations', { params }),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  submitVerification: (id, data) => api.post(`/organizations/${id}/verification`, data)
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (partnerId) => api.get(`/messages/${partnerId}`),
  sendMessage: (data) => api.post('/messages', data)
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read')
};

export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  create: (data) => api.post('/resources', data),
  upvote: (id) => api.post(`/resources/${id}/upvote`)
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleSuspend: (id) => api.put(`/admin/users/${id}/suspend`),
  verifyOrganization: (id, data) => api.put(`/admin/organizations/${id}/verify`, data),
  getReports: () => api.get('/admin/reports'),
  submitReport: (data) => api.post('/admin/reports', data),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data)
};

export default api;
