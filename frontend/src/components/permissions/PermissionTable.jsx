import React from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const PermissionTable = ({ permissions, pagination, onEdit, onDelete, onPageChange, onCreate }) => {
    if (!permissions || permissions.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No permissions found</p>
                <button
                    onClick={onCreate}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                >
                    <FaPlus size={14} />
                    Create Permission
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-center align-middle">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                            <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">#</th>
                            <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Permission Name</th>
                            <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Roles</th>
                            <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Created At</th>
                            <th className="py-3.5 px-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.map((permission, index) => (
                            <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                <td className="py-3.5 px-4 text-sm text-gray-700 font-medium">
                                    {((pagination?.current_page || 1) - 1) * (pagination?.per_page || 10) + index + 1}
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                                        {permission.name}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        {permission.roles_count || 0} roles
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-sm text-gray-600">
                                    {permission.created_at ? new Date(permission.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(permission)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                                            title="Edit"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(permission)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                            title="Delete"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-2">
                    <div className="text-sm text-gray-600">
                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="px-4 py-2 border border-gray-300 rounded-2xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 bg-purple-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-600/20">
                            {pagination.current_page}
                        </span>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="px-4 py-2 border border-gray-300 rounded-2xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionTable;