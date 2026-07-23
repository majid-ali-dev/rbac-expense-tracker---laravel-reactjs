import { create } from 'zustand';
import { categoryAPI } from '../services/categoryApi';
import { showSuccess, showError } from '../utils/toast';

const useCategoryStore = create((set, get) => ({
    categories: [],
    category: null,
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    },

    fetchCategories: async (page = 1, perPage = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryAPI.getCategories(page, perPage);
            const { data, meta } = response.data;

            set({
                categories: data,
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
            const errorMessage = error.response?.data?.message || 'Failed to fetch categories';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    fetchCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryAPI.getCategory(id);
            const category = response.data.data;
            set({ category, loading: false });
            return { success: true, category };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch category';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    createCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryAPI.createCategory(categoryData);
            const category = response.data.data;
            showSuccess('Category created successfully');

            await get().fetchCategories(1, get().pagination.per_page);
            set({ loading: false });
            return { success: true, category };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] ||
                error.response?.data?.message ||
                'Failed to create category';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });
        try {
            const response = await categoryAPI.updateCategory(id, categoryData);
            const category = response.data.data;
            showSuccess('Category updated successfully');

            await get().fetchCategories(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true, category };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.name?.[0] ||
                error.response?.data?.message ||
                'Failed to update category';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            await categoryAPI.deleteCategory(id);
            showSuccess('Category deleted successfully');

            await get().fetchCategories(get().pagination.current_page, get().pagination.per_page);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete category';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    clearCategory: () => set({ category: null }),
    clearError: () => set({ error: null }),
}));

export default useCategoryStore;