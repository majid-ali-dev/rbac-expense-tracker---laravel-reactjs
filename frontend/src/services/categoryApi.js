import api from './api';

export const categoryAPI = {
    getCategories: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/categories?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getCategory: (id) => api.get(`/categories/${id}`),

    // cycle_id = the cycle context being edited; a closed cycle is rejected
    // server-side (closed cycles are read-only).
    createCategory: (data, cycleId = null) =>
        api.post('/categories', cycleId ? { ...data, cycle_id: cycleId } : data),

    updateCategory: (id, data, cycleId = null) =>
        api.put(`/categories/${id}`, cycleId ? { ...data, cycle_id: cycleId } : data),

    deleteCategory: (id, cycleId = null) =>
        api.delete(`/categories/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),

    getAllCategories: () => api.get('/categories/all'),
};