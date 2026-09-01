import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import usePermission from '../../hooks/usePermission';
import useTranslation from '../../hooks/useTranslation';

const RoleTable = ({ roles = [], pagination, onEdit, onDelete, onCreate, onPageChange }) => {
    const { can } = usePermission();
    const { t } = useTranslation();

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
            header: t('roleName'),
            accessorFn: (row) => row.name,

            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'users_count',
            header: t('users'),
            accessorFn: (row) => row.users_count || 0,
            cell: ({ getValue }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {getValue()} {getValue() === 1 ? t('user') : t('users')}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'created_at',
            header: t('createdAt'),
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
            header: t('actions'),
            accessorFn: (row) => row.id,
            cell: ({ row }) => {
                const role = row.original;

                return (
                    <div className="flex items-center justify-center gap-2">
                        {can('roles.edit') && (
                            <button
                                onClick={() => onEdit(role)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                                title="Edit"
                            >
                                <FaEdit size={16} />
                            </button>
                        )}
                        {can('roles.delete') && (
                            <button
                                onClick={() => onDelete(role)}
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
            data={roles}
            columns={columns}
            title={t('rolesTitle')}
            createButtonText={t('createRole')}
            onCreate={can('roles.create') ? onCreate : null}
            searchPlaceholder={t('searchByIdName')}
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
        />
    );
};

export default RoleTable;