import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import { FaChartBar } from 'react-icons/fa';
import ChartCard from '../ChartCard';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <p className="font-semibold mb-0.5">{payload[0].payload.name}</p>
            <p className="text-blue-300">Rs. {payload[0].value.toFixed(2)}</p>
        </div>
    );
};

const CategoryBreakdownChart = ({ data }) => {
    const hasData = data && data.length > 0;

    return (
        <ChartCard
            title="Category Breakdown"
            subtitle="Top spending categories"
            icon={FaChartBar}
            iconColor="bg-purple-500"
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#475569' }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={18}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No category data available
                </div>
            )}
        </ChartCard>
    );
};

export default CategoryBreakdownChart;