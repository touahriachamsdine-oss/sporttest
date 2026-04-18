'use client';

import { useState } from 'react';
import { UserPlus, ShieldPlus, ChevronLeft, Loader2, Mail, Lock, User } from 'lucide-react';
import { signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: authError } = await signUp.email({
                email,
                password,
                name,
                callbackURL: "/auth/login"
            });

            if (authError) {
                setError(authError.message || "Profile initialization failed.");
                setLoading(false);
                return;
            }

            router.push("/auth/login");
        } catch (err) {
            setError("Recruitment protocol error. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-white font-mono">
            {/* Cyberpunk Background */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="scanline" />

            <div className="w-full max-w-lg relative z-10">
                <div className="cyber-panel p-8 md:p-12 border border-white/5 bg-black/40 backdrop-blur-xl rounded-2xl">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100 mb-8 transition-opacity"
                    >
                        <ChevronLeft size={14} /> Back to Authorization
                    </Link>

                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 group hover:border-purple-400 transition-all shadow-[0_0_20px_rgba(188,19,254,0.1)]">
                            <ShieldPlus size={32} className="text-purple-400" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-chrome leading-none mb-2 text-glow-purple">
                            Operative_Recruitment
                        </h1>
                        <p className="text-[10px] tracking-[0.3em] opacity-40 uppercase font-bold text-center">Initialize New Neural Health Interface</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 opacity-70 ml-1">User_Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="ALIAS"
                                        className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-12 py-4 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 transition-all font-mono text-sm"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 opacity-70 ml-1">Email_Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="email"
                                        placeholder="MAIL@DOMAIN.NET"
                                        className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-12 py-4 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 transition-all font-mono text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-cyan-400 uppercase tracking-widest block mb-2 opacity-70 ml-1">Access_Key</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-12 py-4 text-cyan-100 placeholder:text-cyan-900/50 focus:outline-none focus:border-cyan-400 transition-all font-mono text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] uppercase font-bold tracking-wider text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 cyber-panel flex items-center justify-center gap-3 py-5 bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all uppercase tracking-[0.2em] font-black text-xs group disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                <>
                                    <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                                    Initialize Interface
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
