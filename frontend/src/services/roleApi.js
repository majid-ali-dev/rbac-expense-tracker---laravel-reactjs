import api from './api';

export const roleAPI = {
    // Get all roles with pagination
    getRoles: (page = 1, perPage = 15) =>
        api.get(`/roles?page=${page}&per_page=${perPage}`),

    // Get single role
    getRole: (id) => api.get(`/roles/${id}`),

    // Create role
    createRole: (data) => api.post('/roles', data),

    // Update role
    updateRole: (id, data) => api.put(`/roles/${id}`, data),

    // Delete role
    deleteRole: (id) => api.delete(`/roles/${id}`),

    // Get all roles (without pagination)
    getAllRoles: () => api.get('/roles/all'),
};