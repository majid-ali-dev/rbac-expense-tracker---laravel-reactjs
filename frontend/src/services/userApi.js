import api from './api';

export const userAPI = {
    // Get all users (scoped to a billing cycle)
    getUsers: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/users?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    // Get single user
    getUser: (id) => api.get(`/users/${id}`),

    // Create user
    createUser: (data) => api.post('/users', data),

    // Update user
    updateUser: (id, data) => api.put(`/users/${id}`, data),

    // Update total amount
    updateTotal: (id, total_amount) => api.put(`/users/${id}/total`, { total_amount }),

    // Delete user
    deleteUser: (id) => api.delete(`/users/${id}`),

    // Get all roles
    getRoles: () => api.get('/users/roles'),

    // Get user with payment history (scoped to a billing cycle)
    getUserWithPayments: (id, cycleId = null) =>
        api.get(`/users/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),
};