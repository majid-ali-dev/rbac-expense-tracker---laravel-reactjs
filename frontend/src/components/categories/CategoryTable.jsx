import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import usePermission from '../../hooks/usePermission';

const CategoryTable = ({ categories = [], pagination, cycleFilter, readOnly = false, onEdit, onDelete, onCreate, onPageChange }) => {
    const { can } = usePermission();

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
            header: 'Category Name',
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'expense_count',
            header: 'Expenses (Cycle)',
            accessorFn: (row) => row.expense_count ?? '-',
            cell: ({ getValue }) => (
                <span className="text-gray-700 font-medium">{getValue()}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_expense',
            header: 'Spent (Cycle)',
            accessorFn: (row) => row.total_expense ?? '-',
            cell: ({ getValue }) => {
                const value = getValue();
                return value === '-' || value == null ? (
                    <span className="text-gray-400">-</span>
                ) : (
                    <span className="font-bold text-blue-600">
                        Rs. {parseFloat(value).toFixed(2)}
                    </span>
                );
            },
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
            cell: ({ row }) => {
                const category = row.original;

                return readOnly ? (
                    // Closed (historical) cycles are read-only.
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Closed</span>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        {can('categories.edit') && (
                            <button
                                onClick={() => onEdit(category)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                                title="Edit"
                            >
                                <FaEdit size={16} />
                            </button>
                        )}
                        {can('categories.delete') && (
                            <button
                                onClick={() => onDelete(category)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                title="Delete"
                            >
                                <FaTrash size={16} />
                            </button>
                        )}
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    return (
        <>
            {cycleFilter && (
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    {readOnly && (
                        <p className="text-sm text-gray-500">
                            This cycle is closed and read-only. You can only modify data in the current open cycle.
                        </p>
                    )}
                    <div className={readOnly ? '' : 'ml-auto'}>{cycleFilter}</div>
                </div>
            )}
            <DataTable
                data={categories}
            columns={columns}
            title="Manage Categories"
            createButtonText="Add Category"
            onCreate={can('categories.create') && !readOnly ? onCreate : null}
            searchPlaceholder="Search by ID, Name..."
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
            />
        </>
    );
};

export default CategoryTable;