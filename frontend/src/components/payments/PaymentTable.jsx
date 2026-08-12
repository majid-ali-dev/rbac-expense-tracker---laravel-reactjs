import React from 'react';
import { FaPlusCircle, FaEye } from 'react-icons/fa';
import DataTable from '../common/DataTable';
import usePermission from '../../hooks/usePermission';

const PaymentTable = ({ users = [], pagination, stats, cycleFilter, readOnly = false, onAddPayment, onPageChange }) => {
    const { can } = usePermission();

    const columns = [
        {
            id: 'user',
            header: 'USER',
            accessorFn: (row) => row.name,
            cell: ({ getValue }) => (
                <span className="font-semibold text-gray-900">{getValue() || '-'}</span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_amount',
            header: 'TOTAL (RS)',
            accessorFn: (row) => row.total_amount || 0,
            cell: ({ getValue }) => (
                <span className="font-bold text-gray-900">
                    {parseFloat(getValue()).toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'total_paid',
            header: 'PAID (RS)',
            accessorFn: (row) => row.total_paid || 0,
            cell: ({ getValue }) => (
                <span className="font-bold text-green-600">
                    {parseFloat(getValue()).toFixed(2)}
                </span>
            ),
            enableSorting: true,
        },
        {
            id: 'remaining',
            header: 'REMAINING (RS)',
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
            header: 'STATUS',
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
            header: 'ACTION',
            accessorFn: (row) => row.id,
            cell: ({ row }) => {
                const userData = row.original;
                const isPaid = userData.payment_status === 'paid';

                // Only users with payments.create may add/view payment records;
                // closed (historical) cycles are read-only.
                if (!can('payments.create') || readOnly) {
                    return readOnly ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Closed</span>
                    ) : (
                        <span className="text-gray-400 text-sm">-</span>
                    );
                }

                return (
                    <button
                        onClick={() => onAddPayment(userData)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${isPaid ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20'}`}
                    >
                        {isPaid ? <FaEye size={14} /> : <FaPlusCircle size={14} />}
                        {isPaid ? 'View History' : 'Add Payment'}
                    </button>
                );
            },
            enableSorting: false,
        },
    ];

    const StatsCards = () => {
        if (!stats) return null;
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Amount</p>
                    <p className="text-2xl font-extrabold text-blue-700 mt-1">
                        {parseFloat(stats.total_amount || 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Paid</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-1">
                        {parseFloat(stats.total_paid || 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Remaining</p>
                    <p className="text-2xl font-extrabold text-red-700 mt-1">
                        {parseFloat(stats.total_remaining || 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">Paid / Partial / Unpaid</p>
                    <p className="text-2xl font-extrabold text-gray-700 mt-1">
                        {stats.paid_count || 0} / {stats.partial_count || 0} / {stats.unpaid_count || 0}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div>
            {cycleFilter && (
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <p className="text-sm text-gray-500">
                        {readOnly
                            ? 'This cycle is closed and read-only. Payments can only be recorded in the current open cycle.'
                            : 'Select a cycle to view its member payments'}
                    </p>
                    <div>{cycleFilter}</div>
                </div>
            )}
            <DataTable
                data={users}
                columns={columns}
                title="Member Payments"
                createButtonText={null}
                onCreate={null}
                searchPlaceholder="Search by user name..."
                itemsPerPage={pagination?.per_page || 10}
                currentPage={pagination?.current_page || 1}
                onPageChange={onPageChange}
                pageCount={pagination?.last_page || 1}
            />
            <StatsCards />
        </div>
    );
};

export default PaymentTable;