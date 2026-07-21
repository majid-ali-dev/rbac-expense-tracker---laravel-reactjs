import { create } from 'zustand';
import { roleAPI } from '../services/roleApi';
import { toast } from 'react-hot-toast';

const useRoleStore = create((set, get) => ({
    roles: [],
    role: null,
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    },

    fetchRoles: async (page = 1, perPage = 15) => {
        set({ loading: true, error: null });
        try {
            const response = await roleAPI.getRoles(page, perPage);
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
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchRole: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await roleAPI.getRole(id);
            const role = response.data.data;
            set({ role, loading: false });
            return { success: true, role };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch role';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    createRole: async (roleData) => {
        set({ loading: true, error: null });
        try {
            const response = await roleAPI.createRole(roleData);
            const role = response.data.data;
            toast.success('Role created successfully');

            // Refresh the list
            await get().fetchRoles(1, get().pagination.per_page);

            set({ loading: false });
            return { success: true, role };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] ||
                error.response?.data?.message ||
                'Failed to create role';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    updateRole: async (id, roleData) => {
        set({ loading: true, error: null });
        try {
            const response = await roleAPI.updateRole(id, roleData);
            const role = response.data.data;
            toast.success('Role updated successfully');

            // Refresh the list
            await get().fetchRoles(get().pagination.current_page, get().pagination.per_page);

            set({ loading: false });
            return { success: true, role };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] ||
                error.response?.data?.message ||
                'Failed to update role';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deleteRole: async (id) => {
        set({ loading: true, error: null });
        try {
            await roleAPI.deleteRole(id);
            toast.success('Role deleted successfully');

            // Refresh the list
            await get().fetchRoles(get().pagination.current_page, get().pagination.per_page);

            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete role';
            set({ loading: false, error: errorMessage });
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearRole: () => set({ role: null }),
    clearError: () => set({ error: null }),
}));

export default useRoleStore;