import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers } from 'react-icons/fa';
import ChartCard from '../ChartCard';

const STATUS_COLORS = {
    Paid: '#22c55e',
    Partial: '#f59e0b',
    Unpaid: '#ef4444',
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    return (
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <p className="font-semibold">{item.name}: {item.value} member{item.value !== 1 ? 's' : ''}</p>
        </div>
    );
};

const renderLegend = (props) => {
    const { payload } = props;
    return (
        <div className="flex justify-center gap-4 mt-3 flex-wrap">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.value}
                </div>
            ))}
        </div>
    );
};

const MemberStatusChart = ({ data, total }) => {
    const hasData = data && data.some((d) => d.value > 0);

    return (
        <ChartCard
            title="Member Payment Status"
            subtitle="Paid vs Partial vs Unpaid"
            icon={FaUsers}
            iconColor="bg-cyan-500"
        >
            {hasData ? (
                <div className="relative">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={STATUS_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-8%' }}>
                        <span className="text-2xl font-extrabold text-gray-900">{total}</span>
                        <span className="text-[11px] text-gray-400 font-medium">Members</span>
                    </div>
                </div>
            ) : (
                <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    No member data available
                </div>
            )}
        </ChartCard>
    );
};

export default MemberStatusChart;