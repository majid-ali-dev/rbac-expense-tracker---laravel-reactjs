import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers } from 'react-icons/fa';
import ChartCard from '../ChartCard';

const STATUS_GRADIENTS = {
    Paid: ['#4ade80', '#16a34a'],
    Partial: ['#fbbf24', '#d97706'],
    Unpaid: ['#f87171', '#dc2626'],
};

const RADIAN = Math.PI / 180;

// Renders the percentage (45%, 30%, ...) inside each donut segment,
// matching the requested Budget/Member Payment Status design.
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    if (!value) return null;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="700"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)', pointerEvents: 'none' }}
        >
            {`${Math.round(percent * 100)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload, total }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
    return (
        <div className="bg-gray-900/95 backdrop-blur text-white text-xs rounded-xl px-3.5 py-2.5 shadow-2xl border border-white/10">
            <p className="font-semibold">
                {item.name}: <span className="font-bold">{item.value}</span> member{item.value !== 1 ? 's' : ''}
                <span className="font-bold text-gray-300"> · {pct}%</span>
            </p>
        </div>
    );
};

const renderLegend = (props, total) => {
    const { payload } = props;
    return (
        <div className="flex justify-center gap-5 mt-4 flex-wrap">
            {payload.map((entry, index) => {
                const pct = total > 0 ? Math.round(((entry.payload?.value || 0) / total) * 100) : 0;
                const statusName = entry.value;
                const color = STATUS_GRADIENTS[statusName] ? STATUS_GRADIENTS[statusName][0] : '#94a3b8';
                return (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {entry.value}
                        <span className="text-gray-900 font-extrabold">{pct}%</span>
                    </div>
                );
            })}
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
                    <ResponsiveContainer width="100%" height={270}>
                        <PieChart>
                            <defs>
                                {data.map((entry, i) => {
                                    const [from, to] = STATUS_GRADIENTS[entry.name] || ['#94a3b8', '#64748b'];
                                    return (
                                        <linearGradient key={i} id={`statusGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={from} />
                                            <stop offset="100%" stopColor={to} />
                                        </linearGradient>
                                    );
                                })}
                            </defs>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={62}
                                outerRadius={92}
                                paddingAngle={4}
                                cornerRadius={6}
                                label={renderPieLabel}
                                labelLine={false}
                                isAnimationActive
                                animationDuration={800}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={`url(#statusGrad${index})`} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip total={total} />} />
                            <Legend content={(props) => renderLegend(props, total)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
                        <span className="text-[26px] font-extrabold text-gray-900 leading-none">{total}</span>
                        <span className="text-[10.5px] text-gray-400 font-semibold mt-1 uppercase tracking-wide">Members</span>
                    </div>
                </div>
            ) : (
                <div className="h-[270px] flex items-center justify-center text-sm text-gray-400">
                    No member data available
                </div>
            )}
        </ChartCard>
    );
};

export default MemberStatusChart;