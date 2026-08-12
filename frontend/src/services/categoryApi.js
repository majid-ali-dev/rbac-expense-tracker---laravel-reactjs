import api from './api';

export const categoryAPI = {
    getCategories: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/categories?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getCategory: (id) => api.get(`/categories/${id}`),

    createCategory: (data) => api.post('/categories', data),

    updateCategory: (id, data) => api.put(`/categories/${id}`, data),

    deleteCategory: (id) => api.delete(`/categories/${id}`),

    getAllCategories: () => api.get('/categories/all'),
};