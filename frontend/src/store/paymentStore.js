import { create } from 'zustand';
import { paymentAPI } from '../services/paymentApi';
import { showSuccess, showError } from '../utils/toast';

const usePaymentStore = create((set, get) => ({
    users: [],
    user: null,
    stats: null,
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchPayments: async (page = 1, perPage = 10, cycleId = null) => {
        set({ loading: true, error: null });
        try {
            const response = await paymentAPI.getPayments(page, perPage, cycleId);
            const { data, meta } = response.data;

            set({
                users: data.users || [],
                stats: data.stats || null,
                pagination: meta || {
                    current_page: page,
                    per_page: perPage,
                    total: 0,
                    last_page: 1,
                },
                loading: false,
            });
            return { success: true, data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch payments';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchAddPayment: async (id, cycleId = null) => {
        set({ loading: true, error: null });
        try {
            const response = await paymentAPI.getAddPayment(id, cycleId);
            const user = response.data.data;
            set({ user, loading: false });
            return { success: true, user };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch user details';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    submitPayment: async (id, amount, cycleId = null) => {
        set({ loading: true, error: null });
        try {
            const response = await paymentAPI.submitPayment(id, { paid_amount: amount }, cycleId);
            showSuccess('Payment added successfully');
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to submit payment';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deletePayment: async (id, cycleId = null) => {
        set({ loading: true, error: null });
        try {
            await paymentAPI.deletePayment(id, cycleId);
            showSuccess('Payment deleted successfully');
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete payment';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearUser: () => set({ user: null }),
    clearError: () => set({ error: null }),
}));

export default usePaymentStore;