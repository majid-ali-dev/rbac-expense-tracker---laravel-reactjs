import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes } from 'react-icons/fa';
import useNotificationStore from '../../../store/notificationStore';

const NotificationModal = ({ notification, onClose, onRead }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleOk = async () => {
        setIsVisible(false);
        if (onRead) {
            await onRead(notification.id);
        }
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!notification || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all animate-scaleIn">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100 rounded-2xl">
                            <FaBell className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">New Notification</h2>
                            <p className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleOk}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <h3 className="text-md font-bold text-gray-900 mb-2">{notification.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {notification.content}
                    </p>
                </div>

                {/* OK Button */}
                <button
                    onClick={handleOk}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default NotificationModal;