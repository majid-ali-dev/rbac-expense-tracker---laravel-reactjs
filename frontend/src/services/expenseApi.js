import api from './api';

export const expenseAPI = {
    getExpenses: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/expenses?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getExpense: (id) => api.get(`/expenses/${id}`),

    createExpense: (data, cycleId = null) =>
        api.post('/expenses', cycleId ? { ...data, cycle_id: cycleId } : data),

    updateExpense: (id, data, cycleId = null) =>
        api.put(`/expenses/${id}`, cycleId ? { ...data, cycle_id: cycleId } : data),

    deleteExpense: (id, cycleId = null) =>
        api.delete(`/expenses/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),

    getCategories: () => api.get('/expenses/categories'),
};