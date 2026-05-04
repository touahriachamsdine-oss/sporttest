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
  const { t, language, setLanguage, theme, setTheme, isRTL } = useApp();
  const [readings, setReadings] = useState<any[]>([]);
  const [dataSession, setDataSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'sleep'>('live');

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

  const startSession = async (label: string = 'active') => {
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
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full ${dataSession ? 'bg-green-500 shadow-[0_0_10px_#39ff14]' : 'bg-red-500 shadow-[0_0_10px_#ff003c]'} animate-pulse`} />
              <span className="text-[8px] font-mono opacity-60 uppercase">{dataSession ? t('streaming') : t('idle')}</span>
            </div>
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
                  label={t('ambient_temp')}
                  value={current.ambient_temp ? Number(current.ambient_temp).toFixed(1) : '--'}
                  unit="°C"
                  icon={Thermometer}
                  color="green"
                />
                <MetricCard
                  label={t('noise')}
                  value={current.sound_db ? Number(current.sound_db).toFixed(1) : '--'}
                  unit="dB"
                  icon={Activity}
                  color="purple"
                />
              </div>

              {/* Realtime Waveforms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-white/5">
                <HealthChart
                  data={readings}
                  dataKey="ir_raw"
                  color="var(--neon-green)"
                  label="NEURAL_PPG"
                  unit="RAW"
                />
                <HealthChart
                  data={readings}
                  dataKey="mic_raw"
                  color="var(--neon-yellow)"
                  label="AMBIENT_AMP"
                  unit="RAW"
                />
              </div>

              {/* Vital State Charts */}
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
                    <div className="flex bg-black/40 border border-white/5 p-1 rounded gap-1">
                      <button
                        onClick={() => startSession('combat')}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        COMBAT_SYNC
                      </button>
                      <button
                        onClick={() => startSession('sleep')}
                        disabled={loading}
                        className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        SLEEP_SYNC
                      </button>
                    </div>
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
              <AIChat context={{ metrics: current, session_active: !!dataSession }} />

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
        ) : activeTab === 'history' ? (
          <HistoryCalendar history={history} t={t} />
        ) : (
          <SleepArchive deviceId={DEVICE_ID} />
        )
        }
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
            onClick={() => { setActiveTab('sleep'); }}
            className={`flex-1 flex flex-col items-center py-2 transition-all rounded-xl ${activeTab === 'sleep' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'text-white/30'}`}
          >
            <Moon size={20} />
            <span className="text-[8px] font-bold uppercase mt-1 tracking-widest font-mono">Rest</span>
          </button>
        </div>
      </nav>

      {/* Desktop Centered Nav */}
      <div className="hidden md:flex fixed bottom-10 left-1/2 -translate-x-1/2 z-50 p-1 bg-black/60 rounded-full border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] items-center">
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
          Archive_Log
        </button>
        <button
          onClick={() => setActiveTab('sleep')}
          className={`px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-black transition-all rounded-full ${activeTab === 'sleep' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] border border-amber-500/30' : 'text-white/40 hover:text-white/70'}`}
        >
          Sleep_Archive
        </button>
      </div>

      {/* Footer Branding - Desktop Only */}
      <footer className="hidden md:block pt-10 pb-20 text-center relative z-10 border-t border-white/5 opacity-20">
        <p className="text-[9px] uppercase tracking-[1em] font-black">evex Neural Interface // Decentralized Health Stream</p>
      </footer>
    </div >
  );
}
function HistoryCalendar({ history, t }: { history: any[], t: any }) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [selectedDate, setSelectedDate] = useState<any>(null);

  // Generate 28 days of calendar
  const today = new Date();
  const calendarDays = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (27 - i));
    return d;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="cyber-panel p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black tracking-tighter text-purple-400 flex items-center gap-3">
            <HistoryIcon size={20} className="animate-pulse" />
            HEALTH_CHRONO_LOG
          </h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-red-500" /> BPM
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold opacity-40 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-cyan-400" /> SpO2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map(d => (
            <div key={d} className="text-[10px] font-black text-white/20 text-center pb-4 border-b border-white/5 uppercase tracking-widest">{d}</div>
          ))}
          {calendarDays.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const data = history.find(h => h.date.startsWith(dateStr));

            return (
              <div
                key={i}
                onClick={() => data && setSelectedDate(data)}
                className={`aspect-square border flex flex-col p-3 group transition-all relative overflow-hidden cursor-pointer ${data ? 'border-purple-500/40 bg-purple-500/[0.02] hover:bg-purple-500/10' : 'border-white/5 bg-black/40 opacity-20'}`}
              >
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100">{date.getDate()}</span>
                  {data && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />}
                </div>

                {data && (
                  <div className="mt-auto space-y-1 relative z-10">
                    <div className="h-1 w-full bg-red-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${(data.avg_hr / 160) * 100}%` }} />
                    </div>
                    <div className="h-1 w-full bg-cyan-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${data.avg_spo2}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="cyber-panel p-8 border-purple-500 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">
              Log_Detail // {new Date(selectedDate.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest">Close_X</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('avg_bpm')}</span>
              <span className="text-3xl font-black text-red-500 display-font">{Math.round(selectedDate.avg_hr)}<span className="text-xs ml-1 opacity-40">BPM</span></span>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('avg_oxygen')}</span>
              <span className="text-3xl font-black text-cyan-400 display-font">{Math.round(selectedDate.avg_spo2)}%</span>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('noise_floor')}</span>
              <span className="text-3xl font-black text-purple-400 display-font">{selectedDate.avg_sound?.toFixed(1)}<span className="text-xs ml-1 opacity-40">dB</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SleepArchive({ deviceId }: { deviceId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/sessions?device_id=${deviceId}`)
      .then(res => res.json())
      .then(data => setSessions(data));
  }, [deviceId]);

  return (
    <div className="space-y-8 pb-20 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="cyber-panel p-8">
        <h2 className="text-xl font-black tracking-tighter text-amber-400 mb-8 flex items-center gap-3">
          <Moon size={20} className="animate-pulse" />
          TEMPORAL_REST_CHART
        </h2>

        <div className="grid grid-cols-7 gap-3">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-[10px] font-black text-white/20 text-center pb-4 border-b border-white/5 uppercase tracking-widest">{d}</div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const date = i - 3; // Shift to start from a reasonable day
            if (date < 1 || date > 31) return <div key={i} className="aspect-square opacity-5 bg-white/5 border border-white/5" />;

            const daySessions = sessions.filter(s => s.label === 'sleep' && new Date(s.start_time).getDate() === date);
            const totalDuration = daySessions.reduce((acc, s) => {
              if (!s.ended_at) return acc;
              return acc + (new Date(s.ended_at).getTime() - new Date(s.start_time).getTime());
            }, 0);

            const intensity = Math.min(totalDuration / (8 * 3600000), 1); // 8 hours for max intensity

            return (
              <div key={i} className={`aspect-square border flex flex-col p-3 group transition-all relative overflow-hidden ${daySessions.length > 0 ? 'border-amber-500/30' : 'border-white/5 bg-black/40'}`}>
                <span className="text-[10px] font-mono opacity-20 relative z-10">{date}</span>
                {daySessions.length > 0 ? (
                  <div
                    className="absolute inset-0 bg-amber-500/10 z-0 transition-all group-hover:bg-amber-500/20"
                    style={{ opacity: 0.1 + intensity * 0.4 }}
                  />
                ) : null}
                {daySessions.length > 0 && (
                  <div className="mt-auto flex justify-end relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="cyber-panel overflow-hidden border-amber-500/20 bg-amber-500/[0.02]">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/20">
              <th className="p-6">Cycle_Start</th>
              <th className="p-6">Duration</th>
              <th className="p-6">Phase_Sync</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {sessions.filter(s => s.label === 'sleep').sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()).map(s => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="p-6 flex flex-col">
                  <span className="text-white group-hover:text-amber-400 transition-colors font-bold capitalize">
                    {new Date(s.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[9px] opacity-40 italic">{new Date(s.start_time).toLocaleTimeString()}</span>
                </td>
                <td className="p-6 text-white font-mono uppercase tracking-tighter">
                  {s.ended_at ? `${Math.round((new Date(s.ended_at).getTime() - new Date(s.start_time).getTime()) / 60000)}m` : <span className="text-amber-500 animate-pulse font-black tracking-widest leading-none">MONITORING_ACTIVE</span>}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500/40 rounded-full" style={{ width: s.ended_at ? '85%' : '0%' }} />
                    </div>
                    <span className="text-[9px] opacity-40">{s.ended_at ? '85%' : 'SYNC...'}</span>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.filter(s => s.label === 'sleep').length === 0 && (
              <tr>
                <td colSpan={3} className="p-20 text-center text-[10px] uppercase opacity-20 tracking-widest italic">
                  NO_REST_CYCLES_DETECTED // OPERATIVE_OVERLOAD
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
