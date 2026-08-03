import api from './api';

export const notificationAPI = {
    // Get all notifications (Admin)
    getNotifications: () => api.get('/notifications'),

    // Get unread notifications (Member)
    getUnread: () => api.get('/notifications/unread'),

    // Get read notifications (Member)
    getRead: () => api.get('/notifications/read'),

    // Get unread count (Member)
    getUnreadCount: () => api.get('/notifications/unread-count'),

    // Create notification (Admin)
    createNotification: (data) => api.post('/notifications', data),

    // Update notification (Admin)
    updateNotification: (id, data) => api.put(`/notifications/${id}`, data),

    // Delete notification (Admin)
    deleteNotification: (id) => api.delete(`/notifications/${id}`),

    // Mark as read (Member)
    markAsRead: (id) => api.post(`/notifications/${id}/mark-read`),
};