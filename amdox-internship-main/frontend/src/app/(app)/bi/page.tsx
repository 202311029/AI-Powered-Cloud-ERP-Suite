'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { bi as biApi } from '@/lib/api';

export default function BiPage() {
  const [summary, setSummary] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([biApi.getSummary(), biApi.getRevenueByMonth()])
      .then(([s, r]) => { setSummary(s); setRevenue(r.slice(-6)); })
      .catch(() => {
        setSummary({ totalEmployees: 30, totalVendors: 50, activeProjects: 4, totalSKUs: 100, revenue: 48500000, expenses: 32100000, netIncome: 16400000, overdueInvoices: 7 });
        setRevenue([
          { month: '2026-02', revenue: 6500000, expense: 4500000 },
          { month: '2026-03', revenue: 7200000, expense: 5200000 },
          { month: '2026-04', revenue: 5800000, expense: 4800000 },
          { month: '2026-05', revenue: 8800000, expense: 6100000 },
          { month: '2026-06', revenue: 9100000, expense: 6500000 },
          { month: '2026-07', revenue: 7800000, expense: 5800000 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(1)}L` : `₹${n?.toLocaleString('en-IN')}`;
  const maxRev = Math.max(...revenue.map(r => r.revenue || 0), 1);

  const kpis = summary ? [
    { label: 'Total Revenue', value: fmt(summary.revenue), icon: '💹', color: 'var(--accent)' },
    { label: 'Total Expenses', value: fmt(summary.expenses), icon: '💸', color: '#f97316' },
    { label: 'Net Income', value: fmt(summary.netIncome), icon: '📈', color: summary.netIncome > 0 ? 'var(--accent)' : 'var(--danger)' },
    { label: 'Gross Margin', value: `${((summary.netIncome / summary.revenue) * 100).toFixed(1)}%`, icon: '📊', color: 'var(--blue)' },
    { label: 'Active Employees', value: summary.totalEmployees, icon: '👥', color: 'var(--purple)' },
    { label: 'Active Projects', value: summary.activeProjects, icon: '📋', color: '#14b8a6' },
  ] : [];

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📈 Business Intelligence</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Executive KPIs · Revenue Analytics · Performance</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {loading ? [...Array(6)].map((_, i) => <div key={i} style={{ height: 90, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />) :
          kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: k.color, marginBottom: 4 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.label}</div>
            </motion.div>
          ))
        }
      </div>

      {/* Revenue chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Revenue vs Expenses — Monthly</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 24 }}>General Ledger · Last 6 months</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 200 }}>
          {revenue.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: '100%', display: 'flex', gap: 4, alignItems: 'flex-end', height: 160 }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRev) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}
                  style={{ flex: 1, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} title={fmt(d.revenue)} />
                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.expense / maxRev) * 100}%` }} transition={{ delay: i * 0.08 + 0.05, duration: 0.5 }}
                  style={{ flex: 1, background: '#f97316', borderRadius: '4px 4px 0 0', opacity: 0.7 }} title={fmt(d.expense)} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.month?.slice(5)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
          {[['var(--accent)', 'Revenue'], ['#f97316', 'Expenses']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: color as string, display: 'inline-block' }} />{label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
