import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { showError } from '../../utils/toast';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        expenses: { count: 0, total: 0 },
        paymentData: null,
        memberStats: null,
        allPaymentsSummary: null,
        recentExpenses: [],
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await dashboardAPI.getDashboard();
            const data = response.data.data;

            setDashboardData({
                expenses: data.expenses || { count: 0, total: 0 },
                paymentData: data.payment_data || null,
                memberStats: data.member_stats || null,
                allPaymentsSummary: data.all_payments_summary || null,
                recentExpenses: data.recent_expenses || [],
            });
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load dashboard';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Error Loading Dashboard</p>
                        <p className="text-sm mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasData = dashboardData.expenses.count > 0 ||
        dashboardData.paymentData ||
        (dashboardData.memberStats && dashboardData.memberStats.total > 0);

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, <span className="font-semibold">{user?.name || 'User'}</span>!
                    {user?.roles && user.roles.length > 0 && (
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {user.roles.map(r => r.name).join(', ')}
                        </span>
                    )}
                </p>
                {user?.permissions && user.permissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {user.permissions.slice(0, 5).map((perm, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {perm}
                            </span>
                        ))}
                        {user.permissions.length > 5 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{user.permissions.length - 5} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <DashboardStats
                expenses={dashboardData.expenses}
                paymentData={dashboardData.paymentData}
                memberStats={dashboardData.memberStats}
                allPaymentsSummary={dashboardData.allPaymentsSummary}
            />

            {/* No Data Message */}
            {!hasData && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="text-gray-500 text-lg font-medium">No data available</p>
                    <p className="text-sm text-gray-400 mt-1">Start adding expenses and payments</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;