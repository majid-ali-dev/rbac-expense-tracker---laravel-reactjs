import api from './api';

export const paymentAPI = {
    getPayments: (page = 1, perPage = 10, cycleId = null) =>
        api.get(`/payments?page=${page}&per_page=${perPage}${cycleId ? `&cycle_id=${cycleId}` : ''}`),

    getAddPayment: (id, cycleId = null) =>
        api.get(`/payments/${id}/add${cycleId ? `?cycle_id=${cycleId}` : ''}`),

    submitPayment: (id, data, cycleId = null) =>
        api.post(`/payments/${id}/pay`, cycleId ? { ...data, cycle_id: cycleId } : data),

    deletePayment: (id, cycleId = null) =>
        api.delete(`/payments/${id}${cycleId ? `?cycle_id=${cycleId}` : ''}`),
};