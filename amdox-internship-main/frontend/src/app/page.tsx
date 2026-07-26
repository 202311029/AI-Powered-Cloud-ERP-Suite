'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const modules = [
  { icon: '🔐', label: 'Multi-Tenant Auth', desc: 'JWT RS256, RBAC, TOTP MFA', color: '#00e5a0' },
  { icon: '📊', label: 'Financial Ledger', desc: 'Double-entry GL, period close, FX', color: '#38bdf8' },
  { icon: '🧾', label: 'AP/AR Automation', desc: 'OCR invoices, aging reports, 3-way match', color: '#a78bfa' },
  { icon: '👥', label: 'HR & Payroll', desc: 'Org chart, TDS/PF/ESI, payslips', color: '#f97316' },
  { icon: '📦', label: 'Supply Chain', desc: 'PO lifecycle, GR, stock levels', color: '#14b8a6' },
  { icon: '🤖', label: 'AI Forecasting', desc: 'Prophet ML demand prediction', color: '#f59e0b' },
  { icon: '📋', label: 'Project Management', desc: 'Gantt, tasks, budgets, timesheets', color: '#ec4899' },
  { icon: '📈', label: 'BI Dashboard', desc: 'Drag-and-drop widgets, SSE live', color: '#00e5a0' },
  { icon: '🔍', label: 'Audit & Compliance', desc: 'Hash-chained immutable trail', color: '#38bdf8' },
  { icon: '🔔', label: 'Notifications', desc: 'In-app, email, webhook events', color: '#a78bfa' },
  { icon: '⚡', label: 'API Gateway', desc: 'Swagger, throttle, helmet', color: '#f97316' },
  { icon: '📱', label: 'PWA / Offline', desc: 'Workbox, service worker, offline queue', color: '#14b8a6' },
];

const stats = [
  { value: '10M+', label: 'Transactions processed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'API p95 latency' },
  { value: '12', label: 'Core ERP modules' },
];

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  return <span>{target}{suffix}</span>;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6,8,16,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="hex-clip" style={{
            width: 32, height: 32, background: 'var(--accent)',
            display: 'grid', placeItems: 'center', color: '#000', fontWeight: 900, fontSize: 14,
          }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.05em' }}>AMDOX ERP</span>
          <span style={{
            marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 20,
            background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.25)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
          }}>v1.0 MVP</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            border: '1px solid var(--border)', color: 'var(--text)',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>Sign in</Link>
          <Link href="/login" style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--accent)', color: '#000', textDecoration: 'none',
            transition: 'all 0.2s',
          }}>Get Started →</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* background glow */}
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,229,160,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {mounted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
              padding: '6px 16px', borderRadius: 20,
              background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.2)',
              fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
            }}>
              <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Production-ready ERP Suite · NestJS 11 + Next.js 15
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
              AI-Powered Cloud ERP<br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Built for Scale
              </span>
            </h1>

            <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
              12 production-grade modules. Multi-tenant, RBAC, JWT auth, double-entry GL,
              Indian payroll engine, AI demand forecasting, and hash-chained audit trail.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                background: 'var(--accent)', color: '#000', textDecoration: 'none',
                boxShadow: '0 0 32px rgba(0,229,160,0.25)',
              }}>Launch Dashboard →</Link>
              <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" style={{
                padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none',
              }}>View API Docs</a>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section style={{ padding: '40px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={mounted ? { opacity: 0, y: 20 } : false}
              animate={mounted ? { opacity: 1, y: 0 } : false}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                padding: '24px 28px', borderRadius: 12, textAlign: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Modules Grid ────────────────────────────────────────────── */}
      <section style={{ padding: '0 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>12 Core ERP Modules</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>
          Every module is a full vertical slice — controller, service, Prisma model, and React page.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {modules.map((mod, i) => (
            <motion.div key={mod.label}
              initial={mounted ? { opacity: 0, scale: 0.95 } : false}
              animate={mounted ? { opacity: 1, scale: 1 } : false}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -3 }}
              style={{
                padding: '20px 22px', borderRadius: 12, cursor: 'default',
                background: 'var(--surface)', border: '1px solid var(--border)',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{mod.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{mod.label}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────────────── */}
      <section style={{
        padding: '48px 32px', textAlign: 'center',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 20, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Technology Stack</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {['NestJS 11', 'Next.js 15', 'React 19', 'TypeScript 5.5', 'Prisma 7', 'PostgreSQL 17 + TimescaleDB',
            'Valkey / BullMQ', 'Meilisearch', 'Prophet ML', 'Tailwind CSS 4', 'Framer Motion', 'Swagger OpenAPI'].map(tech => (
            <span key={tech} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontFamily: 'var(--font-mono)',
              background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)',
            }}>{tech}</span>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to explore?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16 }}>
          Login with demo credentials: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 4 }}>admin@nexaops.com</code> / <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 4 }}>Demo@2026!</code>
        </p>
        <Link href="/login" style={{
          display: 'inline-block', padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 700,
          background: 'var(--accent)', color: '#000', textDecoration: 'none',
          boxShadow: '0 0 48px rgba(0,229,160,0.3)',
        }}>Open Dashboard →</Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2026 Amdox ERP · AI-Powered Cloud Enterprise Suite</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>API Docs</a>
          <Link href="/login" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Login</Link>
        </div>
      </footer>
    </div>
  );
}
