import api from '../lib/api.js';

/** Centralized typed access to backend endpoints. */
export const apiService = {
  // auth
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  login: (identifier, password) => api.post('/auth/login', { identifier, password }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),

  // users
  searchUsers: (q, limit = 20) => api.get('/users/search', { params: { q, limit } }).then((r) => r.data),
  getUser: (id) => api.get(`/users/${id}`).then((r) => r.data),
  updateProfile: (patch) => api.patch('/users/profile', patch).then((r) => r.data),
  blockUser: (id) => api.post(`/users/${id}/block`).then((r) => r.data),
  unblockUser: (id) => api.post(`/users/${id}/unblock`).then((r) => r.data),

  // contacts
  getContacts: () => api.get('/contacts').then((r) => r.data),
  getContactRequests: () => api.get('/contacts/requests').then((r) => r.data),
  sendRequest: (userId) => api.post('/contacts/request', { userId }).then((r) => r.data),
  respondRequest: (requestId, action) => api.post('/contacts/respond', { requestId, action }).then((r) => r.data),
  updateContact: (id, patch) => api.patch(`/contacts/${id}`, patch).then((r) => r.data),
  removeContact: (id) => api.delete(`/contacts/${id}`).then((r) => r.data),
  blockContact: (id) => api.post(`/contacts/${id}/block`).then((r) => r.data),

  // messages
  getConversations: () => api.get('/conversations').then((r) => r.data),
  getMessages: (conversationId, page = 1) => api.get(`/conversations/${conversationId}/messages`, { params: { page } }).then((r) => r.data),
  getOrCreateConversation: (userId) => api.get(`/conversations/with/${userId}`).then((r) => r.data),
  sendMessage: (payload) => api.post('/messages', payload).then((r) => r.data),
  deleteMessage: (id) => api.delete(`/messages/${id}`).then((r) => r.data),

  // calls
  getCallHistory: (page = 1) => api.get('/calls/history', { params: { page } }).then((r) => r.data),
  getCall: (id) => api.get(`/calls/${id}`).then((r) => r.data),

  // emergency
  getEmergencyContacts: () => api.get('/emergency-contacts').then((r) => r.data),
  addEmergencyContact: (payload) => api.post('/emergency-contacts', payload).then((r) => r.data),
  updateEmergencyContact: (id, payload) => api.patch(`/emergency-contacts/${id}`, payload).then((r) => r.data),
  deleteEmergencyContact: (id) => api.delete(`/emergency-contacts/${id}`).then((r) => r.data),

  // admin
  getStats: () => api.get('/admin/stats').then((r) => r.data),
  getAdminUsers: (page = 1) => api.get('/admin/users', { params: { page } }).then((r) => r.data),
  getAdminCalls: () => api.get('/admin/calls').then((r) => r.data),
  getHealth: () => api.get('/admin/health').then((r) => r.data),
  suspendUser: (id) => api.post(`/admin/users/${id}/suspend`).then((r) => r.data),
  unsuspendUser: (id) => api.post(`/admin/users/${id}/unsuspend`).then((r) => r.data),
};

export default apiService;
