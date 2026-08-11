import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBell, FaTimes, FaCheck, FaClock, FaEye, FaUser } from 'react-icons/fa';
import useNotificationStore from '../../../store/notificationStore';
import usePermission from '../../../hooks/usePermission';
import { showDeleteConfirm, showDeletedSuccess, showError } from '../../../utils/toast';

const NotificationManagement = () => {
    const { can } = usePermission();
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingNotification, setViewingNotification] = useState(null);

    const { notifications, loading, fetchNotifications, createNotification, updateNotification, deleteNotification } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleCreate = () => {
        setEditingNotification(null);
        setFormData({ title: '', content: '' });
        setShowForm(true);
    };

    const handleEdit = (notification) => {
        setEditingNotification(notification);
        setFormData({
            title: notification.title,
            content: notification.content,
        });
        setShowForm(true);
    };

    const handleView = (notification) => {
        setViewingNotification(notification);
        setShowViewModal(true);
    };

    const handleDelete = async (notification) => {
        const result = await showDeleteConfirm(
            'Delete Notification?',
            `"${notification.title}" will be deleted permanently.`
        );

        if (result.isConfirmed) {
            const response = await deleteNotification(notification.id);
            if (response.success) {
                await showDeletedSuccess('Deleted!', 'Notification deleted successfully.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let result;
            if (editingNotification) {
                result = await updateNotification(editingNotification.id, formData);
            } else {
                result = await createNotification(formData);
            }

            if (result.success) {
                setShowForm(false);
                setEditingNotification(null);
                setFormData({ title: '', content: '' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingNotification(null);
        setFormData({ title: '', content: '' });
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Intl.DateTimeFormat("en-PK", {
            timeZone: "Asia/Karachi",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // 12-hour format
        }).format(new Date(date));
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-2xl">
                        <FaBell className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage system notifications</p>
                    </div>
                </div>
                {can('notifications.create') && (
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <FaPlus size={14} />
                        Create Notification
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingNotification ? 'Edit Notification' : 'Create Notification'}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter notification title"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter notification content"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaCheck size={14} />
                                {isSubmitting ? 'Saving...' : (editingNotification ? 'Update' : 'Send')}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {!showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center align-middle">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Title</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Content</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Read</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p className="font-medium">No notifications created yet</p>
                                            <p className="text-sm mt-1">Click "Create Notification" to send one</p>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map((notification) => (
                                        <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-left">
                                                {notification.title}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 text-left max-w-xs truncate">
                                                {notification.content}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    <FaCheck size={10} />
                                                    {notification.read_count || 0} / {notification.total_members || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${notification.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {notification.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1 justify-center">
                                                    <FaClock size={12} className="text-gray-400" />
                                                    {notification.created_at
                                                        ? formatDate(notification.created_at)
                                                        : "-"}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(notification)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={15} />
                                                    </button>
                                                    {can('notifications.edit') && (
                                                        <button
                                                            onClick={() => handleEdit(notification)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-105"
                                                            title="Edit"
                                                        >
                                                            <FaEdit size={15} />
                                                        </button>
                                                    )}
                                                    {can('notifications.delete') && (
                                                        <button
                                                            onClick={() => handleDelete(notification)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                                            title="Delete"
                                                        >
                                                            <FaTrash size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewingNotification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Notification Details</h2>
                                <p className="text-sm text-gray-500 mt-0.5">{viewingNotification.title}</p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Content */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Content</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    {viewingNotification.content}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Read</p>
                                    <p className="text-2xl font-extrabold text-blue-700 mt-1">
                                        {viewingNotification.read_count || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Total Members</p>
                                    <p className="text-2xl font-extrabold text-gray-700 mt-1">
                                        {viewingNotification.total_members || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Read List */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Members who read this notification</h4>
                                {viewingNotification.reads && viewingNotification.reads.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-center align-middle">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="py-2 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Member</th>
                                                    <th className="py-2 px-3 text-xs font-bold text-gray-600 uppercase tracking-wider">Read At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewingNotification.reads.map((read) => (
                                                    <tr key={read.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-2 px-3 text-sm text-gray-700 text-left flex items-center gap-2">
                                                            <FaUser size={14} className="text-blue-500" />
                                                            {read.user?.name || 'Unknown'}
                                                        </td>
                                                        <td className="py-2 px-3 text-sm text-gray-600">
                                                            {read.read_at ? formatDate(read.read_at) : "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <p className="text-gray-500 text-sm">No one has read this notification yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManagement;