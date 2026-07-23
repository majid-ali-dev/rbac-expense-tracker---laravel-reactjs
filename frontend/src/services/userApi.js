import api from './api';

export const userAPI = {
    // Get all users
    getUsers: (page = 1, perPage = 10) =>
        api.get(`/users?page=${page}&per_page=${perPage}`),

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

    // Get user with payment history
    getUserWithPayments: (id) => api.get(`/users/${id}`),
};