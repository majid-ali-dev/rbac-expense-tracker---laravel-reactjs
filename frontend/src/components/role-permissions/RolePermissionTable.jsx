import React from 'react';
import { FaEdit } from 'react-icons/fa';
import DataTable from '../common/DataTable';

const RolePermissionTable = ({ roles = [], pagination, onEdit, onPageChange }) => {
    const columns = [
        {
            id: 'id',
            header: 'ID',
            accessorFn: (row) => row.id,
            cell: ({ getValue }) => (
                <span className="font-mono text-sm font-medium text-gray-700">{getValue()}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'name',
            header: 'Role Name',
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'permissions',
            header: 'Permissions',
            accessorFn: (row) => row.permissions || [],
            cell: ({ row }) => {
                const permissions = row.original.permissions || [];
                if (permissions.length === 0) {
                    return (
                        <span className="text-sm text-gray-500">No permissions assigned</span>
                    );
                }
                return (
                    <div className="flex flex-wrap gap-1 justify-center">
                        {permissions.slice(0, 3).map((perm, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                {perm.name}
                            </span>
                        ))}
                        {permissions.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{permissions.length - 3} more
                            </span>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            id: 'permissions_count',
            header: 'Total',
            accessorFn: (row) => row.permissions?.length || 0,
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {getValue()} {getValue() === 1 ? 'permission' : 'permissions'}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'Actions',
            accessorFn: (row) => row.id,
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onEdit(row.original)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm font-medium"
                    >
                        <FaEdit size={14} />
                        Assign Permissions
                    </button>
                </div>
            ),
            enableSorting: false,
        },
    ];

    return (
        <DataTable
            data={roles}
            columns={columns}
            title="Roles & Permissions"
            onCreate={null}
            searchPlaceholder="Search by ID, Role Name..."
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
        />
    );
};

export default RolePermissionTable;