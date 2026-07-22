import api from './api';

export const rolePermissionAPI = {
    // Get all roles with permissions
    getRolePermissions: (page = 1, perPage = 10) =>
        api.get(`/role-permissions?page=${page}&per_page=${perPage}`),

    // Get role with permissions for editing
    getRolePermissionsEdit: (id) => api.get(`/role-permissions/${id}/edit`),

    // Update role permissions
    updateRolePermissions: (id, data) => api.put(`/role-permissions/${id}`, data),
};