'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    unit: string;
    icon: LucideIcon;
    color: 'cyan' | 'green' | 'red' | 'purple' | 'amber';
    trend?: string;
    subValue?: string;
    warning?: boolean;
    animate?: boolean;
}

import { useApp } from '@/context/AppContext';

export default function MetricCard({
    label,
    value,
    unit,
    icon: Icon,
    color,
    trend,
    subValue,
    warning,
    animate
}: MetricCardProps) {
    const { t } = useApp();
    const colorClasses = {
        cyan: 'neon-border-cyan neon-text-cyan',
        green: 'neon-border-green neon-text-green',
        red: 'neon-border-red neon-text-red',
        purple: 'neon-border-purple neon-text-purple',
        amber: 'neon-border-amber neon-text-amber',
    };

    const colorGlows = {
        cyan: 'glow-card-cyan',
        green: 'glow-card-green',
        red: 'glow-card-red',
        purple: 'glow-card-purple',
        amber: 'glow-card-amber',
    };

    return (
        <div className={`p-4 rounded-lg bg-black/40 backdrop-blur-md transition-all duration-500 border border-white/5 hover:border-opacity-50 group cursor-default ${colorClasses[color]} ${colorGlows[color]} ${warning ? 'animate-pulse border-red-500 bg-red-500/5' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity font-bold">{label}</span>
                <div className="p-1.5 rounded bg-white/5 border border-white/5 group-hover:border-current transition-all">
                    <Icon size={16} className={animate && label === 'Heart Rate' ? 'animate-heartbeat' : 'group-hover:scale-110 transition-transform'} />
                </div>
            </div>

            <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-bold tracking-tighter display-font group-hover:tracking-normal transition-all">{value}</span>
                <span className="text-[10px] opacity-30 font-medium uppercase">{unit}</span>
            </div>

            {trend && (
                <div className="mt-2 text-[10px] opacity-60 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {trend}
                </div>
            )}

            {subValue && !warning && (
                <div className="mt-1 text-[9px] opacity-40 font-bold uppercase tracking-tight italic">
                    {subValue}
                </div>
            )}

            {warning && (
                <div className="mt-1 text-[9px] text-red-400 font-bold uppercase tracking-tight">
                    {subValue || 'CRITICAL THRESHOLD REACHED'}
                </div>
            )}
        </div>
    );
}
