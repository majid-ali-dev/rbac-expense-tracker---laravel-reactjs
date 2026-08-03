import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStats from '../../components/dashboard/DashboardStats';
import ExpenseTrendChart from '../../components/dashboard/charts/ExpenseTrendChart';
import CategoryBreakdownChart from '../../components/dashboard/charts/CategoryBreakdownChart';
import MemberStatusChart from '../../components/dashboard/charts/MemberStatusChart';
import BudgetHealthChart from '../../components/dashboard/charts/BudgetHealthChart';
import NotificationBell from '../../components/dashboard/notification/NotificationBell';
import { showError } from '../../utils/toast';

const initialState = {
    billingCycle: null,
    flags: { can_view_expense: false, show_admin_section: false },
    expenses: null,
    paymentData: null,
    memberStats: null,
    allPaymentsSummary: null,
    charts: { expense_trend: [], category_breakdown: [] },
    budgetHealth: null,
};

const Dashboard = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(initialState);

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
                billingCycle: data.billing_cycle || null,
                flags: data.flags || { can_view_expense: false, show_admin_section: false },
                expenses: data.expenses || null,
                paymentData: data.payment_data || null,
                memberStats: data.member_stats || null,
                allPaymentsSummary: data.all_payments_summary || null,
                charts: data.charts || { expense_trend: [], category_breakdown: [] },
                budgetHealth: data.budget_health || null,
            });
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            const errorMessage = err.response?.data?.message || 'Failed to load dashboard';
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
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

    const { flags } = dashboardData;
    const showExpenseCharts = flags.can_view_expense;
    const showAdminCharts = flags.show_admin_section;
    const isAdmin = user?.roles?.some(r => r.name === 'manager' || r.name === 'super_admin');

    const hasData =
        (dashboardData.expenses && dashboardData.expenses.count > 0) ||
        dashboardData.paymentData ||
        (dashboardData.memberStats && dashboardData.memberStats.total > 0);

    return (
        <div className="space-y-6">
            <DashboardHeader
                user={user}
                billingCycle={dashboardData.billingCycle}
                isAdmin={showAdminCharts}
                onMonthClosed={fetchDashboardData}
                notificationBell={<NotificationBell isAdmin={isAdmin} />}
            />

            <DashboardStats
                expenses={dashboardData.expenses}
                paymentData={dashboardData.paymentData}
                memberStats={dashboardData.memberStats}
                allPaymentsSummary={dashboardData.allPaymentsSummary}
            />

            {showExpenseCharts && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <ExpenseTrendChart data={dashboardData.charts.expense_trend} />
                    <CategoryBreakdownChart data={dashboardData.charts.category_breakdown} />
                </div>
            )}

            {showAdminCharts && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <MemberStatusChart
                        data={dashboardData.memberStats.status_chart}
                        total={dashboardData.memberStats.total}
                    />
                    <BudgetHealthChart budgetHealth={dashboardData.budgetHealth} />
                </div>
            )}

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