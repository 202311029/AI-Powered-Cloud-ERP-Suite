'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { payroll as payrollApi } from '@/lib/api';

const demoRuns = [
  { id: '1', period: 'July 2026', status: 'Completed', totalGross: 3850000, totalNet: 3216450, employeeCount: 30, completedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '2', period: 'June 2026', status: 'Completed', totalGross: 3720000, totalNet: 3104800, employeeCount: 30, completedAt: new Date(Date.now() - 86400000 * 32).toISOString() },
  { id: '3', period: 'May 2026', status: 'Completed', totalGross: 3650000, totalNet: 3046200, employeeCount: 29, completedAt: new Date(Date.now() - 86400000 * 62).toISOString() },
];

const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(2)}L` : `₹${n?.toLocaleString('en-IN')}`;

export default function PayrollPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    payrollApi.getRuns().then(setRuns).catch(() => setRuns(demoRuns)).finally(() => setLoading(false));
  }, []);

  async function handleRunPayroll() {
    setRunning(true);
    const now = new Date();
    const period = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    try {
      const run = await payrollApi.runPayroll({ period, periodStart: start, periodEnd: end });
      setRuns(prev => [run, ...prev]);
    } catch {
      alert('Start the backend to run payroll');
    } finally {
      setRunning(false);
    }
  }

  const latest = runs[0];

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>💰 Payroll</h1>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 10px' }}>Payroll Engine</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Indian statutory payroll · TDS / PF / ESI / PT</p>
        </div>
        <button id="run-payroll-btn" onClick={handleRunPayroll} disabled={running} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: running ? 'rgba(0,229,160,0.4)' : 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {running && <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
          {running ? 'Processing...' : '▶ Run Payroll'}
        </button>
      </div>

      {/* Summary cards */}
      {latest && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Last Gross Payout', value: fmt(latest.totalGross), icon: '💵', color: 'var(--text)' },
            { label: 'Last Net Payout', value: fmt(latest.totalNet), icon: '💚', color: 'var(--accent)' },
            { label: 'Total Deductions', value: fmt(latest.totalGross - latest.totalNet), icon: '📋', color: '#f59e0b' },
            { label: 'Employees Paid', value: latest.employeeCount, icon: '👥', color: 'var(--blue)' },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginBottom: 4 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {latest?.status === 'Completed' && (
        <div style={{ marginBottom: 20, padding: '16px 18px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--accent)', fontWeight: 600 }}>
          Processed Successfully — latest payroll run is complete.
        </div>
      )}

      {/* Tax breakdown info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>🇮🇳 Indian Statutory Deductions Applied</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { name: 'PF (Employee)', rate: '12% of Basic', color: 'var(--blue)' },
            { name: 'PF (Employer)', rate: '12% of Basic', color: 'var(--blue)' },
            { name: 'ESI', rate: '0.75% (if CTC ≤ ₹21K)', color: '#a78bfa' },
            { name: 'Professional Tax', rate: '₹200/month', color: '#14b8a6' },
            { name: 'TDS', rate: 'As per IT Slabs', color: '#f59e0b' },
          ].map(d => (
            <div key={d.name} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{d.name}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: d.color }}>{d.rate}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Run history */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>Payroll Run History</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Period', 'Status', 'Employees', 'Gross Payout', 'Net Payout', 'Processed On'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} style={{ padding: '12px 16px' }}><div style={{ height: 13, borderRadius: 4, background: 'var(--surface-2)', width: '80%' }} /></td>)}</tr>)
            ) : runs.map((run, i) => (
              <motion.tr key={run.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{run.period}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)', fontWeight: 600, color: run.status === 'Completed' ? 'var(--accent)' : run.status === 'Processing' ? '#f59e0b' : 'var(--danger)', background: run.status === 'Completed' ? 'var(--accent-dim)' : 'rgba(245,158,11,0.1)' }}>{run.status}</span>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{run.employeeCount}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(run.totalGross)}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--accent)' }}>{fmt(run.totalNet)}</td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{run.completedAt ? new Date(run.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
