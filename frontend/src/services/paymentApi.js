import api from './api';

export const paymentAPI = {
    getPayments: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/payments?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getAddPayment: (id, cycleId = null) =>
        api.get(`/payments/${id}/add${cycleId ? `?cycle_id=${cycleId}` : ''}`),

    submitPayment: (id, data) => api.post(`/payments/${id}/pay`, data),

    deletePayment: (id) => api.delete(`/payments/${id}`),
};