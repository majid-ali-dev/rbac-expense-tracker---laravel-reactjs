import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import { showSuccess, showError } from '../utils/toast';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await authAPI.login({ email, password });
                    const { data } = response.data;

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });

                    showSuccess('Login successful!');
                    return { success: true, data: data.user };
                } catch (error) {
                    let errorMessage = 'Login failed. Please try again.';
                    if (error.response?.data?.errors) {
                        const errors = Object.values(error.response.data.errors).flat();
                        errorMessage = errors[0] || errorMessage;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    }

                    set({ loading: false, error: errorMessage, isAuthenticated: false });
                    showError(errorMessage);
                    return { success: false, error: errorMessage };
                }
            },

            register: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const response = await authAPI.register(userData);
                    const { data } = response.data;

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });

                    showSuccess('Registration successful!');
                    return { success: true, data };
                } catch (error) {
                    let errorMessage = 'Registration failed. Please try again.';
                    if (error.response?.data?.errors) {
                        const errors = Object.values(error.response.data.errors).flat();
                        errorMessage = errors[0] || errorMessage;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    }

                    set({ loading: false, error: errorMessage, isAuthenticated: false });
                    showError(errorMessage);
                    return { success: false, error: errorMessage };
                }
            },

            logout: async () => {
                try {
                    await authAPI.logout();
                    showSuccess('Logged out successfully');
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        loading: false,
                        error: null,
                    });
                }
            },

            fetchUser: async () => {
                set({ loading: true });
                try {
                    const response = await authAPI.me();
                    const user = response.data.data;
                    set({
                        user: user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });
                    return { success: true, user };
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                        error: error.response?.data?.message || 'Failed to fetch user',
                    });
                    return { success: false, error: error.response?.data?.message };
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;