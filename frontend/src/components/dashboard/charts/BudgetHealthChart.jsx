import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { FaWallet, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';
import ChartCard from '../ChartCard';

const STATUS_CONFIG = {
    safe: {
        label: 'On Track',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
        lineColor: '#22c55e',
        icon: FaCheckCircle,
    },
    caution: {
        label: 'Caution',
        badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        lineColor: '#f59e0b',
        icon: FaExclamationTriangle,
    },
    danger: {
        label: 'Danger Zone',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        lineColor: '#ef4444',
        icon: FaExclamationCircle,
    },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl space-y-1">
            <p className="font-semibold mb-1">Day {label}</p>
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
    const hasEnoughPoints = trend && trend.length >= 2;
    const hasAnyTrend = trend && trend.length > 0;

    // Day-wise x-axis: every day (1,2,3...) when few days,
    // alternate days (1,3,5...) when the cycle gets longer.
    const tickInterval = hasAnyTrend
        ? trend.length > 25 ? 2 : trend.length > 12 ? 1 : 0
        : 0;

    const summaryStrip = (
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
    );

    return (
        <ChartCard
            title="Budget Health"
            subtitle={`Day ${daysElapsed}/${daysInMonth} \u00b7 ${monthProgress}% of cycle`}
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
            {hasEnoughPoints ? (
                <>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={trend}
                            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                            barGap={2}
                            barCategoryGap="30%"
                        >
                            <defs>
                                <linearGradient id="bhIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="100%" stopColor="#16a34a" />
                                </linearGradient>
                                <linearGradient id="bhExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={config.lineColor} />
                                    <stop offset="100%" stopColor={config.lineColor} stopOpacity={0.55} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="day"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                interval={tickInterval}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                                domain={[0, 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                            <Legend
                                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 4 }}
                                iconType="circle"
                                iconSize={8}
                            />
                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="url(#bhIncomeGrad)"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={16}
                            />
                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="url(#bhExpenseGrad)"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={16}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    {summaryStrip}
                </>
            ) : hasAnyTrend ? (
                <>
                    <div className="h-[140px] flex flex-col items-center justify-center text-center px-6">
                        <div className="p-3 bg-slate-50 rounded-full mb-3">
                            <FaHourglassHalf className="text-slate-500" size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-700">Cycle just started</p>
                        <p className="text-xs text-gray-400 mt-1">Chart will build up over the next few days</p>
                    </div>
                    {summaryStrip}
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
