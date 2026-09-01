import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import usePermission from '../../hooks/usePermission';
import useTranslation from '../../hooks/useTranslation';

const UserTable = ({ users = [], pagination, cycleFilter, readOnly = false, onEdit, onDelete, onView, onCreate, onPageChange }) => {
    const { can } = usePermission();
    const { t } = useTranslation();
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
            header: t('name'),
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'email',
            header: t('email'),
            accessorFn: (row) => row.email,
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'phone',
            header: t('phone'),
            accessorFn: (row) => row.phone,
            cell: ({ getValue }) => (
                <span className="text-gray-700">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_amount',
            header: t('totalAmount'),
            accessorFn: (row) => row.total_amount || 0,
            cell: ({ getValue }) => {
                const amount = parseFloat(getValue());
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="font-bold text-gray-900">
                            {amount.toFixed(2)}
                        </span>
                    </div>
                );
            },
            enableSorting: true,
        },
        {
            id: 'total_paid',
            header: t('paid'),
            accessorFn: (row) => row.total_paid || 0,
            cell: ({ getValue }) => {
                const amount = parseFloat(getValue());
                return (
                    <span className="font-bold text-green-600">
                        {amount.toFixed(2)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'remaining',
            header: t('remaining'),
            accessorFn: (row) => row.remaining || 0,
            cell: ({ getValue }) => {
                const amount = parseFloat(getValue());
                return (
                    <span className={`font-bold ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {amount.toFixed(2)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'payment_status',
            header: t('status'),
            accessorFn: (row) => row.payment_status || 'unpaid',
            cell: ({ getValue }) => {
                const status = getValue();
                const badgeClass = {
                    'paid': 'bg-green-100 text-green-700',
                    'partial': 'bg-yellow-100 text-yellow-700',
                    'unpaid': 'bg-red-100 text-red-700',
                }[status] || 'bg-gray-100 text-gray-700';

                const icon = {
                    'paid': '✓',
                    'partial': '⏳',
                    'unpaid': '✕',
                }[status] || '•';

                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                        <span>{icon}</span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            id: 'actions',
            header: t('actions'),
            accessorFn: (row) => row.id,
            cell: ({ row }) => {
                const userData = row.original;

                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => onView(userData)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                            title="View"
                        >
                            <FaEye size={16} />
                        </button>
                        {readOnly ? (
                            // Closed (historical) cycles are read-only.
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Closed</span>
                        ) : (
                            <>
                                {can('users.edit') && (
                                    <button
                                        onClick={() => onEdit(userData)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all hover:scale-105"
                                        title="Edit"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                )}
                                {can('users.delete') && (
                                    <button
                                        onClick={() => onDelete(userData)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                        title="Delete"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                )}
                            </>
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
                            {t('readOnly')}
                        </p>
                    )}
                    <div className={readOnly ? '' : 'ml-auto'}>{cycleFilter}</div>
                </div>
            )}
            <DataTable
                data={users}
            columns={columns}
            title={t('usersList')}
            createButtonText={t('addNewUser')}
            onCreate={can('users.create') && !readOnly ? onCreate : null}
            searchPlaceholder={t('searchByIdNameEmail')}
            itemsPerPage={pagination?.per_page || 10}
            currentPage={pagination?.current_page || 1}
            onPageChange={onPageChange}
            pageCount={pagination?.last_page || 1}
            />
        </>
    );
};

export default UserTable;