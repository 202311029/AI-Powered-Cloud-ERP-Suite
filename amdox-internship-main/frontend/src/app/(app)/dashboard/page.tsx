'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { bi, hr, supply, finance } from '@/lib/api';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
  index: number;
}

function KpiCard({ label, value, sub, color = 'var(--accent)', icon, index }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -2 }}
      style={{
        padding: '20px 22px', borderRadius: 12,
        background: 'var(--surface)', border: '1px solid var(--border)',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        {sub && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    </motion.div>
  );
}

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toFixed(0)}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    async function load() {
      try {
        const [s, ls, rv] = await Promise.all([
          bi.getSummary(),
          supply.getLowStock(),
          bi.getRevenueByMonth(),
        ]);
        setSummary(s);
        setLowStock(ls);
        setRevenueData(rv.slice(-6));
      } catch (e) {
        // API might not be running in demo
        setSummary({ totalEmployees: 30, totalVendors: 50, activeProjects: 4, totalSKUs: 100, revenue: 48500000, expenses: 32100000, netIncome: 16400000, overdueInvoices: 7 });
        setLowStock([]);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = summary ? [
    { label: 'Total Revenue', value: fmt(summary.revenue), icon: '💹', color: 'var(--accent)', sub: 'AR' },
    { label: 'Total Expenses', value: fmt(summary.expenses), icon: '💸', color: '#f97316', sub: 'AP' },
    { label: 'Net Income', value: fmt(summary.netIncome), icon: '📈', color: summary.netIncome > 0 ? 'var(--accent)' : 'var(--danger)', sub: 'GL' },
    { label: 'Active Employees', value: summary.totalEmployees, icon: '👥', color: 'var(--blue)', sub: 'HR' },
    { label: 'Active Projects', value: summary.activeProjects, icon: '📋', color: '#a78bfa', sub: 'PM' },
    { label: 'Inventory SKUs', value: summary.totalSKUs, icon: '📦', color: '#14b8a6', sub: 'SCM' },
    { label: 'Overdue Invoices', value: summary.overdueInvoices, icon: '⚠️', color: summary.overdueInvoices > 0 ? '#f59e0b' : 'var(--accent)', sub: 'AP/AR' },
    { label: 'Registered Vendors', value: summary.totalVendors, icon: '🏭', color: 'var(--text)', sub: 'SCM' },
  ] : [];

  // Micro bar chart
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue || 0), 1);

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h1>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 10px' }}>Executive Summary</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)',
            background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Live
          </div>
          <span className="flex items-center gap-1.5" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Connected
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: 100, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {kpis.map((k, i) => <KpiCard key={k.label} {...k} index={i} />)}
        </div>
      )}

      {/* Charts + Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        {/* Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Revenue vs Expenses</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Last 6 months · General Ledger</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} /> Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f97316', display: 'inline-block' }} /> Expenses
              </span>
            </div>
          </div>

          {revenueData.length === 0 ? (
            // Demo bar chart when API not connected
            <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              {[
                { month: 'Feb', rev: 65, exp: 45 },
                { month: 'Mar', rev: 72, exp: 52 },
                { month: 'Apr', rev: 58, exp: 48 },
                { month: 'May', rev: 88, exp: 61 },
                { month: 'Jun', rev: 91, exp: 65 },
                { month: 'Jul', rev: 78, exp: 58 },
              ].map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 130 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${d.rev}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}
                      style={{ flex: 1, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${d.exp}%` }} transition={{ delay: i * 0.08 + 0.05, duration: 0.5 }}
                      style={{ flex: 1, background: '#f97316', borderRadius: '4px 4px 0 0', opacity: 0.7 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.month}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              {revenueData.map((d, i) => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 130 }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }} transition={{ delay: i * 0.08 }}
                      style={{ flex: 1, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(d.expense / maxRevenue) * 100}%` }} transition={{ delay: i * 0.08 + 0.05 }}
                      style={{ flex: 1, background: '#f97316', borderRadius: '4px 4px 0 0', opacity: 0.7 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.month}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>⚠️ Low Stock Alerts</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 18 }}>Items below reorder level</div>

          {lowStock.length === 0 ? (
            // Demo items
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { sku: 'RAW-001', name: 'Carbon Steel Rods', stock: 45, reorder: 100 },
                { sku: 'PKG-012', name: 'Bubble Wrap 50m', stock: 3, reorder: 50 },
                { sku: 'ELC-007', name: 'HDMI Cable 2m', stock: 12, reorder: 30 },
                { sku: 'MFG-099', name: 'Bearing Kit 6202', stock: 0, reorder: 20 },
              ].map(item => (
                <div key={item.sku} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: item.stock === 0 ? 'var(--danger)' : '#f59e0b',
                    padding: '2px 8px', borderRadius: 20,
                    background: item.stock === 0 ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                  }}>
                    {item.stock === 0 ? 'OUT' : `${item.stock} left`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lowStock.slice(0, 5).map((item: any) => (
                <div key={item.id} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.sku}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: item.totalStock === 0 ? 'var(--danger)' : '#f59e0b',
                    padding: '2px 8px', borderRadius: 20,
                    background: item.totalStock === 0 ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                  }}>
                    {item.totalStock === 0 ? 'OUT' : `${item.totalStock}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}
      >
        {[
          { href: '/finance', label: 'Open GL', icon: '📊', desc: 'Journal entries' },
          { href: '/hr', label: 'View Employees', icon: '👥', desc: `${summary?.totalEmployees || 30} active` },
          { href: '/supply-chain', label: 'Inventory', icon: '📦', desc: 'Low stock alerts' },
          { href: '/payroll', label: 'Run Payroll', icon: '💰', desc: 'Current period' },
        ].map((q, i) => (
          <a key={q.href} href={q.href} style={{
            padding: '14px 16px', borderRadius: 10, textDecoration: 'none',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 20 }}>{q.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{q.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{q.desc}</div>
            </div>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
