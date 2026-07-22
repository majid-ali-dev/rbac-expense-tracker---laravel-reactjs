import { create } from 'zustand';
import { permissionAPI } from '../services/permissionApi';
import { showSuccess, showError } from '../utils/toast';

const usePermissionStore = create((set, get) => ({
    permissions: [],
    permission: null,
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchPermissions: async (page = 1, perPage = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await permissionAPI.getPermissions(page, perPage);
            const { data, meta } = response.data;
            
            set({
                permissions: data,
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
            const errorMessage = error.response?.data?.message || 'Failed to fetch permissions';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchPermission: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await permissionAPI.getPermission(id);
            const permission = response.data.data;
            set({ permission, loading: false });
            return { success: true, permission };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch permission';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    createPermission: async (permissionData) => {
        set({ loading: true, error: null });
        try {
            const response = await permissionAPI.createPermission(permissionData);
            const permission = response.data.data;
            showSuccess('Permission created successfully');
            
            await get().fetchPermissions(1, get().pagination.per_page);
            set({ loading: false });
            return { success: true, permission };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] || 
                               error.response?.data?.message || 
                               'Failed to create permission';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    updatePermission: async (id, permissionData) => {
        set({ loading: true, error: null });
        try {
            const response = await permissionAPI.updatePermission(id, permissionData);
            const permission = response.data.data;
            showSuccess('Permission updated successfully');
            
            await get().fetchPermissions(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true, permission };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] || 
                               error.response?.data?.message || 
                               'Failed to update permission';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deletePermission: async (id) => {
        set({ loading: true, error: null });
        try {
            await permissionAPI.deletePermission(id);
            showSuccess('Permission deleted successfully');
            
            await get().fetchPermissions(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete permission';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearPermission: () => set({ permission: null }),
    clearError: () => set({ error: null }),
}));

export default usePermissionStore;