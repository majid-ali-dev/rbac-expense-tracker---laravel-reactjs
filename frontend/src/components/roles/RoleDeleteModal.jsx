import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const RoleDeleteModal = ({ role, onConfirm, onCancel, loading }) => {
    if (!role) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <FaExclamationTriangle className="text-red-600" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Delete Role</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <p className="text-gray-600 mb-2">
                    Are you sure you want to delete the role <strong>"{role.name}"</strong>?
                </p>
                <p className="text-sm text-red-600 mb-6">
                    This action cannot be undone. All users with this role will be affected.
                </p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Deleting...' : 'Delete Role'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleDeleteModal;