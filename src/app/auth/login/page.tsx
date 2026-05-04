'use client';

import { useState } from 'react';
import { LogIn, Key, ShieldCheck, ChevronRight, Loader2, Mail, Lock } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: authError } = await signIn.email({
                email,
                password,
                callbackURL: "/"
            });

            if (authError) {
                setError(authError.message || "Authentication failed.");
                setLoading(false);
                return;
            }

            router.push("/");
        } catch (err) {
            setError("Neural connection failed. Please verify credentials.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-white font-mono">
            {/* Cyberpunk Background Effect */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="scanline" />

            <div className="w-full max-w-md relative z-10">
                <div className="cyber-panel p-8 md:p-12 border border-white/5 bg-black/40 backdrop-blur-xl rounded-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group hover:border-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                            <ShieldCheck size={32} className="text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-chrome leading-none mb-2 text-glow-cyan">
                            System_Access
                        </h1>
                        <p className="text-[10px] tracking-[0.3em] opacity-40 uppercase font-bold">evax Neural Gateway</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
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
                            className="w-full h-14 cyber-panel flex items-center justify-center gap-3 py-5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all uppercase tracking-[0.2em] font-black text-xs group disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : (
                                <>
                                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                                    Authorize Access
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5">
                        <p className="text-[10px] tracking-widest opacity-40 uppercase font-bold mb-4 text-center">New Operative?</p>
                        <Link
                            href="/auth/signup"
                            className="w-full py-4 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 text-[10px] uppercase font-black"
                        >
                            Initialize Security Profile <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
