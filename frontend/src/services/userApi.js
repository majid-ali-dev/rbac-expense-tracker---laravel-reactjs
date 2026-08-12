import api from './api';

export const userAPI = {
    // Get all users (scoped to a billing cycle)
    getUsers: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/users?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    // Get single user
    getUser: (id) => api.get(`/users/${id}`),

    // Create user (cycle_id = the cycle context being edited; a closed cycle
    // is rejected server-side)
    createUser: (data, cycleId = null) =>
        api.post('/users', cycleId ? { ...data, cycle_id: cycleId } : data),

    // Update user
    updateUser: (id, data, cycleId = null) =>
        api.put(`/users/${id}`, cycleId ? { ...data, cycle_id: cycleId } : data),

    // Update total amount
    updateTotal: (id, total_amount, cycleId = null) =>
        api.put(`/users/${id}/total`, cycleId ? { total_amount, cycle_id: cycleId } : { total_amount }),

    // Delete user
    deleteUser: (id, cycleId = null) =>
        api.delete(`/users/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),

    // Get all roles
    getRoles: () => api.get('/users/roles'),

    // Get user with payment history (scoped to a billing cycle)
    getUserWithPayments: (id, cycleId = null) =>
        api.get(`/users/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),
};