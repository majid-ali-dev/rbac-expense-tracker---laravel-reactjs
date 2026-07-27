import React from 'react';
import { FaEye, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';

const ExpenseTable = ({ expenses = [], pagination, onView, onEdit, onDelete, onCreate, onPageChange }) => {
    const navigate = useNavigate();

    const handleViewExpenses = () => {
        navigate('/expenses/view');
    };

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
            id: 'user',
            header: 'User',
            accessorFn: (row) => row.user?.name || '-',
            cell: ({ getValue }) => (
                <span className="text-gray-700 font-medium">{getValue()}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'title',
            header: 'Title',
            accessorFn: (row) => row.title,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorFn: (row) => row.amount || 0,
            cell: ({ getValue }) => (
                <span className="font-bold text-blue-600">
                    Rs. {(getValue() || 0).toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'date',
            header: 'Date',
            accessorFn: (row) => row.date_formatted,
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue() || '-'}</span>
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
                        onClick={() => onView(row.original)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                        title="View"
                    >
                        <FaEye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(row.original)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-105"
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
        <div className="space-y-4">
            {/* Header Buttons - Left: Add Expense, Right: View Expenses */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                        <span className="text-lg font-bold">+</span>
                        Add Expense
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleViewExpenses}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20"
                    >
                        <FaFileAlt size={16} />
                        View Expenses
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={expenses}
                columns={columns}
                title=""
                onCreate={null}
                searchPlaceholder="Search by ID, Title, User..."
                itemsPerPage={pagination?.per_page || 10}
                currentPage={pagination?.current_page || 1}
                onPageChange={onPageChange}
                pageCount={pagination?.last_page || 1}
            />
        </div>
    );
};

export default ExpenseTable;