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
import useThemeStore from '../../../store/themeStore';

const GRADIENTS = [
    ['#60a5fa', '#3b82f6'],
    ['#4ade80', '#22c55e'],
    ['#c084fc', '#a855f7'],
    ['#fbbf24', '#f59e0b'],
    ['#22d3ee', '#06b6d4'],
    ['#f87171', '#ef4444'],
];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-gray-900/95 backdrop-blur text-white text-xs rounded-xl px-3.5 py-2.5 shadow-2xl border border-white/10">
            <p className="font-semibold mb-1 text-gray-300">{payload[0].payload.name}</p>
            <p className="font-bold text-white">Rs. {payload[0].value.toFixed(2)}</p>
        </div>
    );
};

const CategoryBreakdownChart = ({ data }) => {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    const hasData = data && data.length > 0 && data.some(d => d.amount > 0);

    return (
        <ChartCard
            title="Category Breakdown"
            subtitle="Top spending categories"
            icon={FaChartBar}
            iconColor="bg-purple-500"
        >
            {hasData ? (
                <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }} barCategoryGap={14}>
                        <defs>
                            {data.map((_, i) => {
                                const [from, to] = GRADIENTS[i % GRADIENTS.length];
                                return (
                                    <linearGradient key={i} id={`catGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={from} />
                                        <stop offset="100%" stopColor={to} />
                                    </linearGradient>
                                );
                            })}
                        </defs>
                        <CartesianGrid strokeDasharray="2 6" horizontal={false} stroke={isDark ? '#3a4150' : '#eef2f6'} />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 'dataMax + 20']}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11.5, fill: isDark ? '#cbd5e1' : '#475569', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            width={82}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : '#f8fafc' }} />
                        <Bar dataKey="amount" radius={[0, 10, 10, 0]} barSize={20} isAnimationActive animationDuration={800}>
                            {data.map((_, index) => (
                                <Cell key={index} fill={`url(#catGrad${index})`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[270px] flex items-center justify-center text-sm text-gray-400">
                    No category data available
                </div>
            )}
        </ChartCard>
    );
};

export default CategoryBreakdownChart;