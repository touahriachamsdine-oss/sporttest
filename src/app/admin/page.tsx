'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, ShieldAlert, ChevronLeft, Loader2, RefreshCcw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-mono p-4 md:p-10 relative overflow-hidden">
            {/* Cyberpunk Background */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="scanline opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-10">
                {/* Header */}
                <header className="flex flex-wrap items-center justify-between gap-6 pb-10 border-b border-white/5">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-4"
                        >
                            <ChevronLeft size={14} /> System_Mainboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <ShieldAlert size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic text-chrome">
                                    Admin_Overwatch
                                </h1>
                                <p className="text-[10px] tracking-[0.3em] opacity-40 uppercase font-bold">Project Operative Management & Monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={fetchUsers}
                            disabled={refreshing}
                            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest"
                        >
                            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} /> Sync_Data
                        </button>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="cyber-panel p-8 space-y-4 group hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400">Total_Operatives</span>
                            <Users size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-4xl font-black italic display-font">{users.length}</div>
                    </div>
                    <div className="cyber-panel p-8 space-y-4 group hover:bg-white/[0.03] transition-all border-l-red-500">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-red-500">Active_Streams</span>
                            <Activity size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-4xl font-black italic display-font">0<span className="text-xs ml-2 opacity-20">/ {users.length}</span></div>
                    </div>
                    <div className="cyber-panel p-8 space-y-4 group hover:bg-white/[0.03] transition-all border-l-purple-500">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-purple-400">Auth_Uptime</span>
                            <ShieldAlert size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-4xl font-black italic display-font">99.9<span className="text-xs ml-1 opacity-20">%</span></div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="cyber-panel overflow-hidden border-t-2 border-t-white/5">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">Operative_Registry</h2>
                        <span className="text-[10px] opacity-30 italic font-mono">Filter: All_Users</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest opacity-40">Alias</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest opacity-40">Protocol_Email</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest opacity-40 text-center">Sessions</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest opacity-40">Registered_Date</th>
                                    <th className="p-6 text-[10px] uppercase font-black tracking-widest opacity-40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="inline-flex flex-col items-center gap-4">
                                                <Loader2 size={32} className="animate-spin text-cyan-400" />
                                                <span className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40">Decrypting_Registry...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((user) => (
                                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black group-hover:border-cyan-500/50 transition-all">
                                                    {user.name?.charAt(0) || "U"}
                                                </div>
                                                <span className="text-sm font-bold">{user.name || "Anonymous"}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 whitespace-nowrap">
                                            <span className="text-xs opacity-60 font-mono italic">{user.email}</span>
                                        </td>
                                        <td className="p-6 text-center whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1 rounded text-[10px] font-black ${user.sessions_count > 0 ? "bg-green-500/10 text-green-500 border border-green-500/30" : "bg-white/5 text-white/20 border border-white/10"}`}>
                                                {user.sessions_count}
                                            </span>
                                        </td>
                                        <td className="p-6 whitespace-nowrap">
                                            <span className="text-[10px] opacity-40 font-bold uppercase">{new Date(user.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="p-6 text-right whitespace-nowrap">
                                            <button
                                                title="View Detailed Telemetry"
                                                className="p-2 text-white/20 hover:text-cyan-400 transition-colors"
                                            >
                                                <Activity size={14} />
                                            </button>
                                            <button
                                                title="User Log"
                                                className="p-2 text-white/20 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
