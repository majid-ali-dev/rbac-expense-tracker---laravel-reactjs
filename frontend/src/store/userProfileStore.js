import { create } from 'zustand';
import { userAPI } from '../services/userApi';
import { showError } from '../utils/toast';

const useUserProfileStore = create((set) => ({
    user: null,
    paymentHistory: [],
    loading: false,
    error: null,

    fetchUserProfile: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await userAPI.getUserWithPayments(id);
            const { user, payment_history } = response.data.data;

            set({
                user: user,
                paymentHistory: payment_history,
                loading: false,
            });
            return { success: true, user, payment_history };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user profile';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearProfile: () => set({ user: null, paymentHistory: [], loading: false, error: null }),
}));

export default useUserProfileStore;