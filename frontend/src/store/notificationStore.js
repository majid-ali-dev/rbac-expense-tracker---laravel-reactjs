import { create } from 'zustand';
import { notificationAPI } from '../services/notificationApi';
import { showSuccess, showError } from '../utils/toast';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadNotifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    // Fetch all notifications (Admin)
    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const response = await notificationAPI.getNotifications();
            set({
                notifications: response.data.data || [],
                loading: false,
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Fetch unread notifications (Member)
    fetchUnreadNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const response = await notificationAPI.getUnread();
            set({
                unreadNotifications: response.data.data || [],
                loading: false,
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch notifications';
            set({ loading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }
    },

    // Get unread count (Member)
    fetchUnreadCount: async () => {
        try {
            const response = await notificationAPI.getUnreadCount();
            const count = response.data.data?.count || 0;
            set({ unreadCount: count });
            return { success: true, count };
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Create notification (Admin)
    createNotification: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await notificationAPI.createNotification(data);
            const notification = response.data.data;
            showSuccess('Notification created successfully!');

            // Refresh list
            await get().fetchNotifications();
            set({ loading: false });
            return { success: true, notification };
        } catch (error) {
            const errorMessage = error.response?.data?.errors?.title?.[0] ||
                error.response?.data?.message ||
                'Failed to create notification';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Update notification (Admin)
    updateNotification: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await notificationAPI.updateNotification(id, data);
            const notification = response.data.data;
            showSuccess('Notification updated successfully! All members will see it again.');

            await get().fetchNotifications();
            set({ loading: false });
            return { success: true, notification };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update notification';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Delete notification (Admin)
    deleteNotification: async (id) => {
        set({ loading: true, error: null });
        try {
            await notificationAPI.deleteNotification(id);
            showSuccess('Notification deleted successfully');

            await get().fetchNotifications();
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete notification';
            set({ loading: false, error: errorMessage });
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    },

    // Mark notification as read (Member)
    markAsRead: async (id) => {
        try {
            await notificationAPI.markAsRead(id);

            // Update unread count
            await get().fetchUnreadCount();

            // Refresh unread list
            await get().fetchUnreadNotifications();

            return { success: true };
        } catch (error) {
            console.error('Error marking as read:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    clearError: () => set({ error: null }),
}));

export default useNotificationStore;