import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentExpenses from '../../components/dashboard/RecentExpenses';
import { showError } from '../../utils/toast';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        paymentData: null,
        recentExpenses: [],
    });

    useEffect(() => {
        // Only fetch if user is authenticated
        if (isAuthenticated && user) {
            console.log('Dashboard: User authenticated, fetching data for:', user.name);
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await dashboardAPI.getDashboard();
            console.log('Dashboard response:', response.data);

            const data = response.data.data;

            setDashboardData({
                stats: data.stats || {},
                paymentData: data.payment_data || null,
                recentExpenses: data.recent_expenses || [],
            });
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading state
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

    // Show error state
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

    // Show welcome message
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
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
                stats={dashboardData.stats}
                paymentData={dashboardData.paymentData}
            />

            {/* Recent Expenses */}
            {dashboardData.stats.can_view_expenses && dashboardData.recentExpenses.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Expenses</h2>
                    <RecentExpenses expenses={dashboardData.recentExpenses} />
                </div>
            )}

            {/* Payment Summary for Members */}
            {dashboardData.paymentData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-semibold text-gray-900">
                                Rs. {dashboardData.paymentData.total_amount?.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Paid</p>
                            <p className="text-lg font-semibold text-green-600">
                                Rs. {dashboardData.paymentData.total_paid?.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Remaining</p>
                            <p className="text-lg font-semibold text-yellow-600">
                                Rs. {dashboardData.paymentData.remaining?.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <span className={`
                                inline-flex px-3 py-1 rounded-full text-sm font-medium
                                ${dashboardData.paymentData.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : dashboardData.paymentData.payment_status === 'partial'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }
                            `}>
                                {dashboardData.paymentData.payment_status?.toUpperCase() || 'UNPAID'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Message when no data */}
            {!dashboardData.stats.can_view_expenses && !dashboardData.paymentData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-600">Welcome! You don't have any data to display yet.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;