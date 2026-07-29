import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { FaWallet, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import ChartCard from '../ChartCard';

const STATUS_CONFIG = {
    safe: {
        label: 'On Track',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
        lineColor: '#22c55e',
        icon: FaCheckCircle,
        message: 'Spending pace is healthy compared to income collected this month.',
    },
    caution: {
        label: 'Caution',
        badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        lineColor: '#f59e0b',
        icon: FaExclamationTriangle,
        message: 'Spending pace is approaching this month\u2019s income — keep an eye on it.',
    },
    danger: {
        label: 'Danger Zone',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        lineColor: '#ef4444',
        icon: FaExclamationCircle,
        message: 'At the current pace, expenses are projected to exceed income before month end.',
    },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl space-y-1">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: Rs. {p.value.toFixed(2)}
                </p>
            ))}
        </div>
    );
};

const BudgetHealthChart = ({ budgetHealth }) => {
    if (!budgetHealth) return null;

    const {
        trend,
        total_income: totalIncome,
        total_expense: totalExpense,
        projected_expense: projectedExpense,
        month_progress_pct: monthProgress,
        days_elapsed: daysElapsed,
        days_in_month: daysInMonth,
        status,
    } = budgetHealth;

    const config = STATUS_CONFIG[status] || STATUS_CONFIG.safe;
    const StatusIcon = config.icon;
    const hasData = trend && trend.length > 0;

    return (
        <ChartCard
            title="Budget Health"
            subtitle={`Day ${daysElapsed}/${daysInMonth} \u00b7 ${monthProgress}% of month`}
            icon={FaWallet}
            iconColor="bg-slate-700"
            className="lg:col-span-2"
            headerRight={
                <span
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${config.badgeClass}`}
                >
                    <StatusIcon size={12} />
                    {config.label}
                </span>
            }
        >
            {hasData ? (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={totalIncome} stroke="#94a3b8" strokeDasharray="4 4" />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke={config.lineColor}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    {/* Compact 3-stat summary — fits cleanly in 2/3 width, no overflow */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Income</p>
                            <p className="text-sm font-extrabold text-green-600 mt-0.5">Rs. {totalIncome.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Spent</p>
                            <p className="text-sm font-extrabold text-gray-900 mt-0.5">Rs. {totalExpense.toFixed(0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Projected</p>
                            <p className="text-sm font-extrabold mt-0.5" style={{ color: config.lineColor }}>
                                Rs. {projectedExpense.toFixed(0)}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
                    Not enough data yet
                </div>
            )}
        </ChartCard>
    );
};

export default BudgetHealthChart;