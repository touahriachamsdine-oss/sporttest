'use client';

import { useState, useEffect } from 'react';
import { Heart, Droplet, Thermometer, Activity, LogIn, LogOut, Sparkles, History as HistoryIcon, Loader2, Languages, Moon, Sun, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import MetricCard from '@/components/dashboard/MetricCard';
import HealthChart from '@/components/dashboard/HealthChart';
import AIChat from '@/components/dashboard/AIChat';
import { useApp } from '@/context/AppContext';
import { Locale } from '@/lib/i18n';

export default function Dashboard() {
  const { t, language, setLanguage, theme, setTheme, isRTL, user, session } = useApp();
  const [readings, setReadings] = useState<any[]>([]);
  const [dataSession, setDataSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

  const DEVICE_ID = 'esp32-v01';

  // Fetch latest readings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ingest?device_id=${DEVICE_ID}&limit=60`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('Fetch failed:', res.status, errData);
          return;
        }
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setReadings(data);
          }
          setLoading(false);
        } catch (parseErr) {
          console.error('JSON Parse error. Raw body:', text, parseErr);
        }
      } catch (err) {
        console.error('Network error in poll:', err);
      }
    };

    // Initial session check
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/sessions');
        const sessions = await res.json();
        const active = sessions.find((s: any) => s.device_id === DEVICE_ID && !s.ended_at);
        if (active) {
          setDataSession(active);
        }
      } catch (err) {
        console.error('Session sync failed');
      }
    };

    fetchData();
    checkActiveSession();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/history?device_id=${DEVICE_ID}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('History fetch failed');
    }
  };

  const startSession = async (label: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: DEVICE_ID, label })
      });
      if (!res.ok) throw new Error('Start failed');
      const data = await res.json();
      setDataSession(data);
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!dataSession) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dataSession.id })
      });
      if (!res.ok) throw new Error('End failed');
      setDataSession(null);
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!readings.length) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        body: JSON.stringify({
          type: 'analyze',
          sessionId: dataSession?.id || (readings[0] && readings[0].session_id)
        })
      });
      const data = await res.json();
      alert(`Session Analysis:\n${data.summary}\nSleep Quality: ${data.sleep_quality}`);
    } catch (err) {
      alert('AI Analysis failed. Check console.');
    } finally {
      setAnalyzing(false);
    }
  };

  const current = readings[readings.length - 1] || {};

  return (
    <div className="max-w-7xl mx-auto min-h-screen relative pb-24 md:pb-10">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header - Optimized for Mobile */}
      <header className="sticky top-0 z-50 p-4 md:p-6 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase italic text-chrome leading-none">
              {t('app_name')}
            </h1>
            <p className="text-[8px] tracking-[0.3em] opacity-40 uppercase font-mono font-bold">{t('link_status')} // {activeTab.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : language === 'ar' ? 'fr' : 'en')}
              className="p-2 text-cyan-400 hover:bg-white/5 rounded transition-all flex items-center gap-2"
              title="Switch Language"
            >
              <Languages size={16} />
              <span className="text-[9px] font-bold uppercase hidden sm:inline">{language}</span>
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'night' : 'dark')}
              className={`p-2 rounded transition-all ${theme === 'night' ? 'text-red-500' : 'text-cyan-400'} hover:bg-white/5`}
              title="Toggle Night Mode"
            >
              {theme === 'night' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                  title="Command Center"
                >
                  <ShieldCheck size={18} />
                </Link>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{user.name || 'Operative'}</span>
                  <span className="text-[8px] opacity-40 font-mono italic">{user.email}</span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/sign-out', { method: 'POST' });
                    window.location.reload();
                  }}
                  className="p-2 bg-white/5 border border-white/5 rounded hover:border-red-500/50 hover:text-red-500 transition-all"
                  title="Disconnect Neural Link"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${dataSession ? 'bg-green-500 shadow-[0_0_10px_#39ff14]' : 'bg-red-500 shadow-[0_0_10px_#ff003c]'} animate-pulse`} />
                <span className="text-[8px] font-mono opacity-60 uppercase">{dataSession ? t('streaming') : t('idle')}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-10 space-y-8 md:space-y-12 relative z-10">
        {activeTab === 'live' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Dashboard */}
            <div className="lg:col-span-2 space-y-10">
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label={t('heart_rate')}
                  value={current.heart_rate ? Number(current.heart_rate).toFixed(0) : '--'}
                  unit="BPM"
                  icon={Heart}
                  color="red"
                  animate
                  warning={Number(current.heart_rate) > 100}
                  subValue={Number(current.heart_rate) > 100 ? "CRITICAL_STATE" : "OPTIMAL_FLOW"}
                />
                <MetricCard
                  label={t('oxygen')}
                  value={current.spo2 ? Number(current.spo2).toFixed(1) : '--'}
                  unit="%"
                  icon={Droplet}
                  color="cyan"
                  warning={Number(current.spo2) < 94}
                  subValue="SYNC_STABLE"
                />
                <MetricCard
                  label={t('temperature')}
                  value={current.temperature ? Number(current.temperature).toFixed(1) : '--'}
                  unit="°C"
                  icon={Thermometer}
                  color="amber"
                />
                <MetricCard
                  label={t('noise')}
                  value={current.sound_db ? Number(current.sound_db).toFixed(1) : '--'}
                  unit="dB"
                  icon={Activity}
                  color="purple"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <HealthChart
                  data={readings}
                  dataKey="heart_rate"
                  color="var(--neon-red)"
                  label="BPM"
                  unit="BPM"
                />
                <HealthChart
                  data={readings}
                  dataKey="spo2"
                  color="var(--neon-cyan)"
                  label="SpO2"
                  unit="%"
                />
              </div>

              {/* Session Controls */}
              <div className="cyber-panel p-8 flex flex-wrap items-center gap-8 group">
                <div className="flex-1 min-w-[200px]">
                  <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">{t('link_status')}_Sync</h3>
                  <p className="text-[10px] opacity-30 font-mono italic truncate">Device: {DEVICE_ID}</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                  {!dataSession ? (
                    <button
                      onClick={() => startSession('sleep')}
                      disabled={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      <LogIn size={14} /> {t('start_probe')}
                    </button>
                  ) : (
                    <button
                      onClick={endSession}
                      disabled={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-400 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      <LogOut size={14} /> {t('end_link')}
                    </button>
                  )}

                  <button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:border-amber-400 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-30"
                  >
                    {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {t('scan')}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Panel */}
            <div className="space-y-8">
              <AIChat context={{ metrics: current, session_active: !!session }} />

              {/* Security Info - Carousel or list on mobile */}
              <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02] space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/20 group-hover:bg-cyan-500 transition-colors" />
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white opacity-40">Security Advisory</h4>
                <div className="text-[11px] leading-relaxed opacity-60 font-mono italic">
                  Biometric telemetry is being processed through Groq-Llama-3-Neural-Link. Packets end-to-end encrypted.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pb-20">
            {history.map((h, i) => (
              <div key={i} className="cyber-panel p-8 border-l-purple-500 group hover:border-opacity-100 hover:bg-purple-500/5 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20 group-hover:border-purple-500">
                    <HistoryIcon size={18} className="text-purple-400 group-hover:text-purple-300" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-purple-100">{new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('avg_bpm')}</span>
                    <span className="text-2xl font-black text-red-500 display-font">{Math.round(h.avg_hr)}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('avg_oxygen')}</span>
                    <span className="text-2xl font-black text-cyan-400 display-font">{Math.round(h.avg_spo2)}%</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{t('noise_floor')}</span>
                    <span className="text-2xl font-black text-purple-400 display-font">{h.avg_sound?.toFixed(1)}<span className="text-xs ml-1 opacity-40">dB</span></span>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="col-span-full text-center py-40 opacity-10 uppercase tracking-[2em] font-black italic">{t('archive_empty')}</div>}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <div className="cyber-panel p-2 flex justify-around items-center gap-2 rounded-2xl border-white/10 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 flex flex-col items-center py-2 transition-all rounded-xl ${activeTab === 'live' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.1)]' : 'text-white/30'}`}
          >
            <Activity size={20} className={activeTab === 'live' ? 'animate-pulse' : ''} />
            <span className="text-[8px] font-bold uppercase mt-1 tracking-widest font-mono">Live</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); fetchHistory(); }}
            className={`flex-1 flex flex-col items-center py-2 transition-all rounded-xl ${activeTab === 'history' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(188,19,254,0.1)]' : 'text-white/30'}`}
          >
            <HistoryIcon size={20} />
            <span className="text-[8px] font-bold uppercase mt-1 tracking-widest font-mono">Logs</span>
          </button>

          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex-1 flex flex-col items-center py-2 text-amber-400 disabled:opacity-30 transition-all active:scale-95"
          >
            {analyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span className="text-[8px] font-bold uppercase mt-1 tracking-widest font-mono">Nexus</span>
          </button>
        </div>
      </nav>

      {/* Desktop Centered Nav */}
      <div className="hidden md:flex fixed bottom-10 left-1/2 -translate-x-1/2 z-50 p-1 bg-black/60 rounded-full border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-black transition-all rounded-full ${activeTab === 'live' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.2)] border border-cyan-500/30' : 'text-white/40 hover:text-white/70'}`}
        >
          Live_Pulse
        </button>
        <button
          onClick={() => { setActiveTab('history'); fetchHistory(); }}
          className={`px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-black transition-all rounded-full ${activeTab === 'history' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(188,19,254,0.2)] border border-purple-500/30' : 'text-white/40 hover:text-white/70'}`}
        >
          Archive_Sync
        </button>
      </div>

      {/* Footer Branding - Desktop Only */}
      <footer className="hidden md:block pt-10 pb-20 text-center relative z-10 border-t border-white/5 opacity-20">
        <p className="text-[9px] uppercase tracking-[1em] font-black">BioTrack Neural Interface // Decentralized Health Stream</p>
      </footer>
    </div>
  );
}
