import { create } from 'zustand';
import { userAPI } from '../services/userApi';
import { showSuccess, showError } from '../utils/toast';

const useUserStore = create((set, get) => ({
    users: [],
    user: null,
    roles: [],
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchUsers: async (page = 1, perPage = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.getUsers(page, perPage);
            const { data, meta } = response.data;

            set({
                users: data,
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
            const errorMessage = error.response?.data?.message || 'Failed to fetch users';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchUser: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.getUser(id);
            const user = response.data.data;
            set({ user, loading: false });
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchRoles: async () => {
        try {
            const response = await userAPI.getRoles();
            const roles = response.data.data;
            set({ roles });
            return { success: true, roles };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch roles';
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    createUser: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.createUser(userData);
            const user = response.data.data;
            showSuccess('User created successfully');

            await get().fetchUsers(1, get().pagination.per_page);
            set({ loading: false });
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.errors ||
                error.response?.data?.message ||
                'Failed to create user';
            set({ loading: false, error: errorMessage });
            if (typeof errorMessage === 'object') {
                const errors = Object.values(errorMessage).flat();
                showError(errors[0] || 'Failed to create user');
            } else {
                showError(errorMessage);
            }
            return { success: false, error: errorMessage };
        }
    },

    updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.updateUser(id, userData);
            const user = response.data.data;
            showSuccess('User updated successfully');

            await get().fetchUsers(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.errors ||
                error.response?.data?.message ||
                'Failed to update user';
            set({ loading: false, error: errorMessage });
            if (typeof errorMessage === 'object') {
                const errors = Object.values(errorMessage).flat();
                showError(errors[0] || 'Failed to update user');
            } else {
                showError(errorMessage);
            }
            return { success: false, error: errorMessage };
        }
    },

    updateTotal: async (id, totalAmount) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.updateTotal(id, totalAmount);
            const user = response.data.data;
            showSuccess('Total amount updated successfully');

            await get().fetchUsers(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update total amount';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
            await userAPI.deleteUser(id);
            showSuccess('User deleted successfully');

            await get().fetchUsers(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete user';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearUser: () => set({ user: null }),
    clearError: () => set({ error: null }),
}));

export default useUserStore;