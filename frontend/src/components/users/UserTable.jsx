import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../common/DataTable';

const UserTable = ({ users = [], pagination, onEdit, onDelete, onCreate, onPageChange }) => {
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
            header: 'Name',
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'email',
            header: 'Email',
            accessorFn: (row) => row.email,
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'phone',
            header: 'Phone',
            accessorFn: (row) => row.phone,
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_amount',
            header: 'Total Amount',
            accessorFn: (row) => row.total_amount || 0,
            cell: ({ getValue }) => (
                <span className="font-medium text-gray-900">
                    {parseFloat(getValue()).toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_paid',
            header: 'Paid',
            accessorFn: (row) => row.total_paid || 0,
            cell: ({ getValue }) => (
                <span className="font-medium text-green-600">
                    {parseFloat(getValue()).toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'remaining',
            header: 'Remaining',
            accessorFn: (row) => row.remaining || 0,
            cell: ({ getValue }) => {
                const value = parseFloat(getValue());
                return (
                    <span className={`font-bold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {value.toFixed(2)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'payment_status',
            header: 'Status',
            accessorFn: (row) => row.payment_status || 'unpaid',
            cell: ({ getValue }) => {
                const status = getValue();
                const badgeClass = {
                    'paid': 'bg-green-100 text-green-700',
                    'partial': 'bg-yellow-100 text-yellow-700',
                    'unpaid': 'bg-red-100 text-red-700',
                }[status] || 'bg-gray-100 text-gray-700';

                return (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
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

    return (
        <DataTable
            data={users}
            columns={columns}
            title="Users List"
            createButtonText="Add User"
            onCreate={onCreate}
            searchPlaceholder="Search by ID, Name, Email..."
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
        />
    );
};

export default UserTable;