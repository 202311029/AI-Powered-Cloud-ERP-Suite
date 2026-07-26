'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [search, setSearch] = useState('');
  const { isOnline, setOnline, showNotifs, toggleNotifs } = useUIStore();

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [setOnline]);

  return (
    <header className="flex items-center gap-4 px-6 border-b flex-shrink-0"
            style={{ height: 'var(--topbar-h)', background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <h1 className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-sans)' }}>{title}</h1>
        {!isOnline && (
          <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded border border-red-500/30 animate-pulse uppercase tracking-widest font-bold">
            Offline Mode
          </span>
        )}
        {subtitle && <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 border w-52 transition-colors focus-within:border-accent"
           style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>⌕</span>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-xs placeholder-opacity-50"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 relative">
        <button
          onClick={toggleNotifs}
          className="relative w-8 h-8 grid place-items-center rounded-lg border text-sm transition-all hover:border-accent"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          🔔
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 grid place-items-center rounded-full text-white border-2 font-bold"
                style={{ background: 'var(--danger)', borderColor: 'var(--surface)', fontSize: 8 }}>3</span>
        </button>

        {showNotifs && (
          <div className="absolute top-10 right-0 w-80 bg-surface border border-border rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2">
             <div className="p-4 border-b border-border flex justify-between items-center">
               <h3 className="text-xs font-bold uppercase tracking-widest text-text">Notifications</h3>
               <button className="text-[10px] text-accent hover:underline">Mark all read</button>
             </div>
             <div className="max-h-96 overflow-y-auto">
                {[
                  { title: 'Payment Run #42 Complete', body: '$284,600 disbursed successfully.', type: 'Finance', status: 'Delivered' },
                  { title: 'Anomaly Detected', body: '5 failed login attempts from unknown IP.', type: 'Security', status: 'Alert' },
                  { title: 'Low Stock Alert: #8821', body: 'Supply Chain auto-reorder initiated.', type: 'SCM', status: 'Auto' },
                ].map((n, i) => (
                  <div key={i} className="p-4 border-b border-border/50 hover:bg-white/[0.02] cursor-pointer last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">{n.type}</span>
                      <span className="text-[8px] text-text-muted">{n.status}</span>
                    </div>
                    <p className="text-xs font-bold text-text mb-0.5">{n.title}</p>
                    <p className="text-[10px] text-text-muted truncate">{n.body}</p>
                  </div>
                ))}
             </div>
             <div className="p-3 bg-bg text-center">
                <a href="/settings" className="text-[10px] text-text-muted hover:text-text">Notification Preferences</a>
             </div>
          </div>
        )}

        <button className="w-8 h-8 grid place-items-center rounded-lg border text-sm transition-all hover:border-accent"
                onClick={() => window.location.href = '/settings'}
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          ⚙
        </button>
      </div>
    </header>
  );
}
