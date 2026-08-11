import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import usePermission from '../../hooks/usePermission';

const CategoryTable = ({ categories = [], pagination, onEdit, onDelete, onCreate, onPageChange }) => {
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

                return (
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
        <DataTable
            data={categories}
            columns={columns}
            title="Manage Categories"
            createButtonText="Add Category"
            onCreate={can('categories.create') ? onCreate : null}
            searchPlaceholder="Search by ID, Name..."
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
        />
    );
};

export default CategoryTable;