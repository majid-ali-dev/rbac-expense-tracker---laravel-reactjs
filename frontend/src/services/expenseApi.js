import api from './api';

export const expenseAPI = {
    getExpenses: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/expenses?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getExpense: (id) => api.get(`/expenses/${id}`),

    createExpense: (data) => api.post('/expenses', data),

    updateExpense: (id, data) => api.put(`/expenses/${id}`, data),

    deleteExpense: (id) => api.delete(`/expenses/${id}`),

    getCategories: () => api.get('/expenses/categories'),
};