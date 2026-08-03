import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import useNotificationStore from '../../../store/notificationStore';
import NotificationModal from './NotificationModal';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = ({ isAdmin = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentNotification, setCurrentNotification] = useState(null);
    const dropdownRef = useRef(null);
    const {
        unreadCount,
        unreadNotifications,
        fetchUnreadCount,
        fetchUnreadNotifications,
        markAsRead
    } = useNotificationStore();

    useEffect(() => {
        if (!isAdmin) {
            fetchUnreadCount();
            fetchUnreadNotifications();

            const interval = setInterval(() => {
                fetchUnreadCount();
                fetchUnreadNotifications();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    // Check for new notification and show modal
    useEffect(() => {
        if (!isAdmin && unreadNotifications.length > 0) {
            // Show the latest unread notification
            const latest = unreadNotifications[0];
            setCurrentNotification(latest);
            setShowModal(true);

            // Mark as read when modal is shown
            // The modal will handle marking as read on OK click
        }
    }, [unreadNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!isAdmin) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                fetchUnreadNotifications();
                fetchUnreadCount();
            }
        }
    };

    const handleModalRead = async (id) => {
        await markAsRead(id);
        await fetchUnreadNotifications();
        await fetchUnreadCount();
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentNotification(null);
        // Show next notification if any
        if (unreadNotifications.length > 1) {
            const next = unreadNotifications[1];
            setCurrentNotification(next);
            setShowModal(true);
        }
    };

    // For admin
    if (isAdmin) {
        return (
            <button
                onClick={() => window.location.href = '/notifications'}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                title="Manage Notifications"
            >
                <FaBell size={18} />
            </button>
        );
    }

    return (
        <>
            <div ref={dropdownRef} className="relative">
                <button
                    onClick={toggleDropdown}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    title="Notifications"
                >
                    {unreadCount > 0 ? (
                        <>
                            <FaBell size={18} className="text-blue-600 animate-bell" />
                            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </>
                    ) : (
                        <FaBellSlash size={18} className="text-gray-400" />
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                        <NotificationDropdown onClose={() => setIsOpen(false)} />
                    </div>
                )}
            </div>

            {/* Notification Modal */}
            {showModal && currentNotification && (
                <NotificationModal
                    notification={currentNotification}
                    onRead={handleModalRead}
                    onClose={handleModalClose}
                />
            )}
        </>
    );
};

export default NotificationBell;