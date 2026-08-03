import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaBell } from 'react-icons/fa';
import useNotificationStore from '../../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const { unreadNotifications, fetchUnreadNotifications, markAsRead, fetchUnreadCount } = useNotificationStore();

    useEffect(() => {
        fetchUnreadNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        setLoading(true);
        try {
            await markAsRead(id);
            await fetchUnreadNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            for (const notification of unreadNotifications) {
                await markAsRead(notification.id);
            }
            await fetchUnreadNotifications();
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    if (unreadNotifications.length === 0) {
        return (
            <div className="p-6 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-gray-500 font-medium">No new notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FaBell size={14} className="text-blue-600" />
                    Notifications
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {unreadNotifications.length} new
                    </span>
                </h3>
                {unreadNotifications.length > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {unreadNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="bg-blue-50 border border-blue-100 rounded-xl p-3 hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900">
                                    {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                    {notification.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <FaClock size={10} />
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                            </div>
                            <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                disabled={loading}
                                className="flex-shrink-0 p-1.5 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                title="Mark as read"
                            >
                                <FaCheckCircle size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                    onClick={onClose}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 font-medium py-1"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;