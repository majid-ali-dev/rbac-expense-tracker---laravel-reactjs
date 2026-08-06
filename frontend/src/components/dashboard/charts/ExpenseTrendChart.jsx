import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { FaChartArea, FaHourglassHalf } from 'react-icons/fa';
import ChartCard from '../ChartCard';
import useThemeStore from '../../../store/themeStore';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <p className="font-semibold mb-0.5">{label}</p>
            <p className="text-blue-300">Rs. {payload[0].value.toFixed(2)}</p>
        </div>
    );
};

const ExpenseTrendChart = ({ data }) => {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    const hasAnyValue = data && data.length > 0 && data.some((d) => d.amount > 0);
    const hasEnoughPoints = data && data.length >= 2;
    const hasData = hasAnyValue && hasEnoughPoints;

    // Naya cycle abhi shuru hua hai — sirf 1 din ka data hai, line banana possible nahi
    const todayOnly = hasAnyValue && !hasEnoughPoints ? data[data.length - 1] : null;

    return (
        <ChartCard
            title="Expense Trend"
            subtitle="Daily spending — current cycle"
            icon={FaChartArea}
            iconColor="bg-blue-500"
            className="lg:col-span-2"
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#3a4150' : '#f1f5f9'} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                            width={45}
                            domain={[0, 'dataMax + 50']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            fill="url(#expenseGradient)"
                            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : todayOnly ? (
                <div className="h-[260px] flex flex-col items-center justify-center text-center px-6">
                    <div className="p-3 bg-blue-50 rounded-full mb-3">
                        <FaHourglassHalf className="text-blue-500" size={20} />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Cycle just started</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Rs. {todayOnly.amount.toFixed(2)} spent so far ({todayOnly.date})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Trend will build up over the next few days</p>
                </div>
            ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No expenses recorded yet this cycle
                </div>
            )}
        </ChartCard>
    );
};

export default ExpenseTrendChart;