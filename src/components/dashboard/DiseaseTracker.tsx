'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, Calendar, FileText, Activity, Save, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Disease {
    id: number;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'managed' | 'remission';
    diagnosed_at: string;
}

export default function DiseaseTracker() {
    const { t, user } = useApp();
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        severity: 'medium',
        status: 'active',
        diagnosed_at: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const res = await fetch('/api/diseases');
            const data = await res.json();
            setDiseases(data);
        } catch (err) {
            console.error('Failed to fetch diseases');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/diseases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetchDiseases();
                setIsAdding(false);
                setFormData({
                    name: '',
                    description: '',
                    severity: 'medium',
                    status: 'active',
                    diagnosed_at: new Date().toISOString().split('T')[0]
                });
            }
        } catch (err) {
            console.error('Failed to add disease');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('CONFIRM_PURGE_SEQUENCE: Are you sure you want to delete this record?')) return;
        try {
            const res = await fetch(`/api/diseases/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDiseases(diseases.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete');
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'text-green-500';
            case 'medium': return 'text-amber-500';
            case 'high': return 'text-red-500';
            case 'critical': return 'text-red-600 animate-pulse';
            default: return 'text-white';
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tighter text-cyan-400 flex items-center gap-3">
                    <Activity size={20} className="animate-pulse" />
                    {t('chronic_conditions').toUpperCase()}
                </h2>
                
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all text-[10px] font-black uppercase tracking-widest ${isAdding ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'}`}
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? 'CANCEL_SYS' : t('add_disease')}
                </button>
            </div>

            {isAdding && (
                <div className="cyber-panel p-8 border-cyan-500/40 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('disease_name')}</label>
                                <input 
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                    placeholder="e.g. Type 2 Diabetes"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('description')}</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50 h-32"
                                    placeholder="Enter clinical intelligence notes..."
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('severity')}</label>
                                    <select 
                                        value={formData.severity}
                                        onChange={e => setFormData({...formData, severity: e.target.value as any})}
                                        className="w-full bg-black border border-white/10 p-3 rounded font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                    >
                                        <option value="low">LOW</option>
                                        <option value="medium">MEDIUM</option>
                                        <option value="high">HIGH</option>
                                        <option value="critical">CRITICAL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('status')}</label>
                                    <select 
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                                        className="w-full bg-black border border-white/10 p-3 rounded font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                    >
                                        <option value="active">ACTIVE</option>
                                        <option value="managed">MANAGED</option>
                                        <option value="remission">REMISSION</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] uppercase tracking-widest opacity-40 font-bold block mb-2">{t('diagnosed_at')}</label>
                                <input 
                                    type="date"
                                    value={formData.diagnosed_at}
                                    onChange={e => setFormData({...formData, diagnosed_at: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 p-3 rounded font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
                            >
                                <Save size={16} />
                                COMMIT_RECORDS
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diseases.map(disease => (
                    <div key={disease.id} className="cyber-panel p-6 border-white/5 bg-white/[0.02] group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full opacity-20 group-hover:opacity-100 transition-all ${
                            disease.severity === 'critical' ? 'bg-red-600' : 
                            disease.severity === 'high' ? 'bg-red-500' : 
                            disease.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-white uppercase italic">{disease.name}</h3>
                                <div className="flex gap-3 mt-1">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${getSeverityColor(disease.severity)}`}>
                                        {disease.severity}_LEVEL
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">
                                        STATUS: {disease.status}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(disease.id)}
                                className="p-2 text-white/10 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        {disease.description && (
                            <div className="mb-6 p-3 bg-black/40 border border-white/5 rounded">
                                <p className="text-[11px] opacity-60 font-mono italic leading-relaxed">
                                    <FileText size={10} className="inline mr-2 opacity-40" />
                                    {disease.description}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-[9px] opacity-40 font-mono">
                            <div className="flex items-center gap-2">
                                <Calendar size={12} />
                                DETECTED: {new Date(disease.diagnosed_at).toLocaleDateString()}
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${disease.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                                SYNC_STABLE
                            </div>
                        </div>
                    </div>
                ))}

                {diseases.length === 0 && !loading && (
                    <div className="md:col-span-2 cyber-panel p-20 text-center opacity-20 italic">
                        {t('no_diseases')}
                    </div>
                )}
            </div>
        </div>
    );
}
