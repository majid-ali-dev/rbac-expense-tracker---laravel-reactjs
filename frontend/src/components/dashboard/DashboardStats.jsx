import React from 'react';
import {
    FaFileAlt,
    FaMoneyBillWave,
    FaWallet,
    FaCheckCircle,
    FaClock,
    FaUsers,
    FaUserCheck,
    FaUserTimes,
    FaUserClock,
    FaUserPlus,
    FaUserMinus
} from 'react-icons/fa';

const DashboardStats = ({ expenses, paymentData, memberStats, allPaymentsSummary }) => {
    const statItems = [];

    // === EXPENSE CARDS ===
    if (expenses) {
        statItems.push({
            label: 'Total Expenses',
            value: expenses.count || 0,
            icon: FaFileAlt,
            color: 'bg-blue-500',
        });
        statItems.push({
            label: 'Expense Amount',
            value: `Rs. ${(expenses.total || 0).toFixed(2)}`,
            icon: FaMoneyBillWave,
            color: 'bg-green-500',
        });
    }

    // === USER PAYMENT CARDS ===
    if (paymentData && paymentData.total_amount > 0) {
        statItems.push({
            label: 'My Total',
            value: `Rs. ${paymentData.total_amount.toFixed(2)}`,
            icon: FaWallet,
            color: 'bg-purple-500',
        });
        statItems.push({
            label: 'My Paid',
            value: `Rs. ${paymentData.total_paid.toFixed(2)}`,
            icon: FaCheckCircle,
            color: 'bg-indigo-500',
        });
        statItems.push({
            label: 'My Remaining',
            value: `Rs. ${paymentData.remaining.toFixed(2)}`,
            icon: FaClock,
            color: 'bg-yellow-500',
        });
    }

    // === ADMIN MEMBER STATS ===
    if (memberStats && Object.keys(memberStats).length > 0) {
        statItems.push({
            label: 'Total Members',
            value: memberStats.total || 0,
            icon: FaUsers,
            color: 'bg-cyan-500',
        });
        statItems.push({
            label: 'Assigned',
            value: memberStats.assigned || 0,
            icon: FaUserPlus,
            color: 'bg-emerald-500',
        });
        statItems.push({
            label: 'Unassigned',
            value: memberStats.unassigned || 0,
            icon: FaUserMinus,
            color: 'bg-gray-500',
        });
        statItems.push({
            label: 'Paid',
            value: memberStats.paid || 0,
            icon: FaUserCheck,
            color: 'bg-green-500',
        });
        statItems.push({
            label: 'Partial',
            value: memberStats.partial || 0,
            icon: FaUserClock,
            color: 'bg-yellow-500',
        });
        statItems.push({
            label: 'Unpaid',
            value: memberStats.unpaid || 0,
            icon: FaUserTimes,
            color: 'bg-red-500',
        });
    }

    // === ADMIN ALL PAYMENTS ===
    if (allPaymentsSummary && Object.keys(allPaymentsSummary).length > 0) {
        statItems.push({
            label: 'All Paid',
            value: `Rs. ${allPaymentsSummary.total_paid.toFixed(2)}`,
            icon: FaCheckCircle,
            color: 'bg-indigo-500',
        });
        statItems.push({
            label: 'All Remaining',
            value: `Rs. ${allPaymentsSummary.total_remaining.toFixed(2)}`,
            icon: FaClock,
            color: 'bg-yellow-500',
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-1 duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {item.label}
                                </p>
                                <p className="text-xl font-extrabold text-gray-900 mt-1">
                                    {item.value}
                                </p>
                            </div>
                            <div className={`${item.color} p-3 rounded-xl text-white shadow-lg`}>
                                <Icon size={20} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;