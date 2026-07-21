import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

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
                    console.log('Login response:', response.data);

                    const { data } = response.data;

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }

                    // Ensure user data is properly set
                    const userData = data.user;

                    set({
                        user: userData,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });

                    return { success: true, data: userData };
                } catch (error) {
                    console.error('Login error:', error);
                    let errorMessage = 'Login failed. Please try again.';

                    if (error.response?.data?.errors) {
                        const errors = Object.values(error.response.data.errors).flat();
                        errorMessage = errors[0] || errorMessage;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    }

                    set({
                        loading: false,
                        error: errorMessage,
                        isAuthenticated: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            register: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const response = await authAPI.register(userData);
                    console.log('Register response:', response.data);

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

                    return { success: true, data };
                } catch (error) {
                    console.error('Register error:', error);
                    let errorMessage = 'Registration failed. Please try again.';

                    if (error.response?.data?.errors) {
                        const errors = Object.values(error.response.data.errors).flat();
                        errorMessage = errors[0] || errorMessage;
                    } else if (error.response?.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response?.data?.error) {
                        errorMessage = error.response.data.error;
                    }

                    set({
                        loading: false,
                        error: errorMessage,
                        isAuthenticated: false,
                    });
                    return { success: false, error: errorMessage };
                }
            },

            logout: async () => {
                try {
                    await authAPI.logout();
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
                    console.log('Fetch user response:', response.data);

                    const user = response.data.data;
                    set({
                        user: user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                    });
                    return { success: true, user };
                } catch (error) {
                    console.error('Fetch user error:', error);
                    // If token is invalid, clear everything
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