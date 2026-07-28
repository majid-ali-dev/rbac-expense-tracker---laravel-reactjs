import api from './api';

export const paymentAPI = {
    getPayments: (page = 1, perPage = 10) =>
        api.get(`/payments?page=${page}&per_page=${perPage}`),

    getAddPayment: (id) => api.get(`/payments/${id}/add`),

    submitPayment: (id, data) => api.post(`/payments/${id}/pay`, data),

    deletePayment: (id) => api.delete(`/payments/${id}`),
};