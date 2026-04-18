'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Activity, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

import { useApp } from '@/context/AppContext';

export default function AIChat({ context }: { context: any }) {
    const { t } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'chat',
                    message: input,
                    context
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection lost. Telemetry stream interrupted.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] cyber-panel rounded-lg border-l-cyan-500 overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.05)]">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#00f3ff] animate-pulse" />
                    <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-cyan-400">
                        {t('neural_command')}
                    </span>
                </div>
                <span className="text-[9px] opacity-30 font-mono tracking-tighter">V.2.4-ACTIVE</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-[rgba(255,255,255,0.01)]">
                {messages.length === 0 && (
                    <div className="text-center py-12 opacity-20 border border-dashed border-white/10 rounded-lg m-2">
                        <Activity size={32} className="mx-auto mb-4 text-cyan-500 animate-pulse" />
                        <p className="text-[10px] uppercase tracking-[0.5em] font-bold">{t('awaiting_sync')}</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] uppercase tracking-widest opacity-30 mb-1 px-1 font-bold">
                            {m.role === 'user' ? 'Local_User' : 'Nexus_AI'}
                        </span>
                        <div className={`max-w-[90%] p-4 rounded-lg text-[11px] leading-relaxed relative ${m.role === 'user'
                            ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-50 rounded-tr-none'
                            : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                            }`}>
                            {m.content}
                            <div className={`absolute top-0 w-1 h-3 ${m.role === 'user' ? 'right-0 -mr-0.5 bg-cyan-500' : 'left-0 -ml-0.5 bg-white/40'}`} />
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex flex-col items-start">
                        <span className="text-[8px] uppercase tracking-widest opacity-30 mb-1 px-1">Processing...</span>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-lg rounded-tl-none">
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-cyan-500 animate-bounce" />
                                <div className="w-1 h-1 bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                                <div className="w-1 h-1 bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-black/60 border-t border-white/5 backdrop-blur-xl">
                <div className="relative group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t('query_placeholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-xs font-mono focus:outline-none focus:border-cyan-500/60 focus:bg-white/[0.07] transition-all placeholder:opacity-20 text-white"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="absolute right-2 top-1.5 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
