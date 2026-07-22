import { create } from 'zustand';
import { rolePermissionAPI } from '../services/rolePermissionApi';
import { showSuccess, showError } from '../utils/toast';

const useRolePermissionStore = create((set, get) => ({
    roles: [],
    role: null,
    allPermissions: [],
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchRoles: async (page = 1, perPage = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await rolePermissionAPI.getRolePermissions(page, perPage);
            const { data, meta } = response.data;

            set({
                roles: data,
                pagination: meta || {
                    current_page: page,
                    per_page: perPage,
                    total: data.length,
                    last_page: 1,
                },
                loading: false,
            });
            return { success: true, data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch roles';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },


    fetchRolePermissions: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await rolePermissionAPI.getRolePermissionsEdit(id);
            const { role, all_permissions } = response.data.data;

            set({
                role: role,
                allPermissions: all_permissions,
                loading: false,
            });
            return { success: true, role, all_permissions };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch role permissions';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    updateRolePermissions: async (id, permissionIds) => {
        set({ loading: true, error: null });
        try {
            const response = await rolePermissionAPI.updateRolePermissions(id, { permissions: permissionIds });
            const role = response.data.data;
            showSuccess('Permissions assigned successfully');

            // Refresh the list
            await get().fetchRoles(get().pagination.current_page, get().pagination.per_page);

            set({ loading: false });
            return { success: true, role };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to assign permissions';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearRole: () => set({ role: null, allPermissions: [] }),
    clearError: () => set({ error: null }),
}));

export default useRolePermissionStore;