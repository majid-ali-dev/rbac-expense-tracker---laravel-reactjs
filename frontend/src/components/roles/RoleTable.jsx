import React from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const RoleTable = ({ roles, pagination, onEdit, onDelete, onPageChange, onCreate }) => {
    if (!roles || roles.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No roles found</p>
                <button
                    onClick={onCreate}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus size={14} />
                    Create Role
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Users</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created At</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role, index) => (
                            <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {((pagination?.current_page || 1) - 1) * (pagination?.per_page || 15) + index + 1}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                    {role.name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {role.users_count || 0} users
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                    {role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(role)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(role)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page <= 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                            {pagination.current_page}
                        </span>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page >= pagination.last_page}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleTable;