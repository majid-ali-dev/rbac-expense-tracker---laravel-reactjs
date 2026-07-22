import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../common/DataTable';

const RoleTable = ({ roles = [], pagination, onEdit, onDelete, onCreate, onPageChange }) => {
    // Define columns for DataTable with proper accessor functions
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
            id: 'users_count',
            header: 'Users',
            accessorFn: (row) => row.users_count || 0,
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {getValue()} {getValue() === 1 ? 'user' : 'users'}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'created_at',
            header: 'Created At',
            accessorFn: (row) => row.created_at,
            cell: ({ getValue }) => (
                <span className="text-gray-600">
                    {getValue() ? new Date(getValue()).toLocaleDateString() : '-'}
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                        title="Edit"
                    >
                        <FaEdit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(row.original)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                        title="Delete"
                    >
                        <FaTrash size={16} />
                    </button>
                </div>
            ),
            enableSorting: false,
        },
    ];

    // Debug: Log the data
    console.log('RoleTable data:', roles);

    return (
        <DataTable
            data={roles}
            columns={columns}
            title="Roles"
            createButtonText="Create Role"
            onCreate={onCreate}
            searchPlaceholder="Search by ID, Name..."
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
        />
    );
};

export default RoleTable;