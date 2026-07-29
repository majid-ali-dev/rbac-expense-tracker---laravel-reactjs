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
import { FaChartArea } from 'react-icons/fa';
import ChartCard from '../ChartCard';

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
    const hasData = data && data.length > 0 && data.some((d) => d.amount > 0);

    return (
        <ChartCard
            title="Expense Trend"
            subtitle="Daily spending — current month"
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
            ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No expenses recorded yet this month
                </div>
            )}
        </ChartCard>
    );
};

export default ExpenseTrendChart;