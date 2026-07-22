import React from 'react';
import { FaFileAlt, FaMoneyBillWave, FaUsers, FaWallet } from 'react-icons/fa';

const DashboardStats = ({ stats, paymentData }) => {
    const statItems = [];

    if (stats?.can_view_expenses) {
        statItems.push({
            label: 'Total Expenses',
            value: stats.expense_count || 0,
            icon: FaFileAlt,
            color: 'bg-blue-500',
        });
        statItems.push({
            label: 'Total Amount',
            value: `Rs. ${(stats.total_amount || 0).toFixed(2)}`,
            icon: FaMoneyBillWave,
            color: 'bg-green-500',
        });
    }

    if (paymentData) {
        statItems.push({
            label: 'Total Assigned',
            value: `Rs. ${(paymentData.total_amount || 0).toFixed(2)}`,
            icon: FaWallet,
            color: 'bg-purple-500',
        });
        statItems.push({
            label: 'Total Paid',
            value: `Rs. ${(paymentData.total_paid || 0).toFixed(2)}`,
            icon: FaUsers,
            color: 'bg-indigo-500',
        });
        statItems.push({
            label: 'Remaining',
            value: `Rs. ${(paymentData.remaining || 0).toFixed(2)}`,
            icon: FaWallet,
            color: 'bg-yellow-500',
        });
        statItems.push({
            label: 'Payment Status',
            value: paymentData.payment_status?.toUpperCase() || 'UNPAID',
            icon: FaWallet,
            color: paymentData.payment_status === 'paid' ? 'bg-green-500' :
                paymentData.payment_status === 'partial' ? 'bg-yellow-500' : 'bg-red-500',
        });
    }

    if (statItems.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No statistics available
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow hover:-translate-y-1 duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                <p className="text-2xl font-extrabold text-gray-900 mt-2">{item.value}</p>
                            </div>
                            <div className={`${item.color} p-3.5 rounded-2xl text-white shadow-lg shadow-${item.color}/30`}>
                                <Icon size={22} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;