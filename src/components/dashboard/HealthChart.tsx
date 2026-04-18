'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthChartProps {
    data: any[];
    dataKey: string;
    color: string;
    label: string;
    unit: string;
}

export default function HealthChart({ data, dataKey, color, label, unit }: HealthChartProps) {
    return (
        <div className="w-full h-48 mt-4 rounded-lg bg-black/20 p-2 border border-white/5">
            <div className="flex justify-between items-center mb-2 px-2">
                <h3 className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{label} Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="recorded_at"
                        hide
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: `1px solid ${color}`, borderRadius: '4px', fontSize: '10px' }}
                        labelStyle={{ display: 'none' }}
                        formatter={(value: any) => [`${value} ${unit}`, label]}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${dataKey})`}
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
