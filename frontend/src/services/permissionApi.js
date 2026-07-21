import api from './api';

export const permissionAPI = {
    // Get all permissions with pagination
    getPermissions: (page = 1, perPage = 15) =>
        api.get(`/permissions?page=${page}&per_page=${perPage}`),

    // Get single permission
    getPermission: (id) => api.get(`/permissions/${id}`),

    // Create permission
    createPermission: (data) => api.post('/permissions', data),

    // Update permission
    updatePermission: (id, data) => api.put(`/permissions/${id}`, data),

    // Delete permission
    deletePermission: (id) => api.delete(`/permissions/${id}`),

    // Get all permissions (without pagination)
    getAllPermissions: () => api.get('/permissions/all'),
};