import React from 'react';
import CloseMonthButton from './CloseMonthButton';

const DashboardHeader = ({ user, billingCycle, isAdmin, onMonthClosed, notificationBell }) => {
    const monthLabel = billingCycle?.label || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, <span className="font-semibold">{user?.name || 'User'}</span>!
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
                        {monthLabel}
                    </span>
                    {/* Close button - icon only */}
                    {isAdmin && billingCycle && (
                        <CloseMonthButton cycleLabel={monthLabel} onClosed={onMonthClosed} />
                    )}
                    {/* Notification Bell */}
                    {notificationBell}
                </div>
            </div>

            {user?.roles && user.roles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {user.roles.map((r, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-semibold">
                            {r.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;