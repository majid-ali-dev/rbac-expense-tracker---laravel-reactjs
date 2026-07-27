import { create } from 'zustand';
import { expenseAPI } from '../services/expenseApi';
import { showSuccess, showError } from '../utils/toast';

const useExpenseStore = create((set, get) => ({
    expenses: [],
    expense: null,
    categories: [],
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchExpenses: async (page = 1, perPage = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await expenseAPI.getExpenses(page, perPage);
            const { data, meta } = response.data;

            set({
                expenses: data,
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
            const errorMessage = error.response?.data?.message || 'Failed to fetch expenses';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchExpense: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await expenseAPI.getExpense(id);
            const expense = response.data.data;
            set({ expense, loading: false });
            return { success: true, expense };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch expense';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchCategories: async () => {
        try {
            const response = await expenseAPI.getCategories();
            const categories = response.data.data;
            set({ categories });
            return { success: true, categories };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    createExpense: async (expenseData) => {
        set({ loading: true, error: null });
        try {
            const response = await expenseAPI.createExpense(expenseData);
            const expense = response.data.data;
            showSuccess('Expense added successfully');

            await get().fetchExpenses(1, get().pagination.per_page);
            set({ loading: false });
            return { success: true, expense };
        } catch (error) {
            const errorMessage = error.response?.data?.errors ||
                error.response?.data?.message ||
                'Failed to create expense';
            set({ loading: false, error: errorMessage });
            if (typeof errorMessage === 'object') {
                const errors = Object.values(errorMessage).flat();
                showError(errors[0] || 'Failed to create expense');
            } else {
                showError(errorMessage);
            }
            return { success: false, error: errorMessage };
        }
    },

    updateExpense: async (id, expenseData) => {
        set({ loading: true, error: null });
        try {
            const response = await expenseAPI.updateExpense(id, expenseData);
            const expense = response.data.data;
            showSuccess('Expense updated successfully');

            await get().fetchExpenses(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true, expense };
        } catch (error) {
            const errorMessage = error.response?.data?.errors ||
                error.response?.data?.message ||
                'Failed to update expense';
            set({ loading: false, error: errorMessage });
            if (typeof errorMessage === 'object') {
                const errors = Object.values(errorMessage).flat();
                showError(errors[0] || 'Failed to update expense');
            } else {
                showError(errorMessage);
            }
            return { success: false, error: errorMessage };
        }
    },

    deleteExpense: async (id) => {
        set({ loading: true, error: null });
        try {
            await expenseAPI.deleteExpense(id);
            showSuccess('Expense deleted successfully');

            await get().fetchExpenses(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete expense';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearExpense: () => set({ expense: null }),
    clearError: () => set({ error: null }),
}));

export default useExpenseStore;