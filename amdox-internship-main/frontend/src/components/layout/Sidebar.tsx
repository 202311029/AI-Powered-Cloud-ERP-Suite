'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: '◈', section: 'Main' },
  { id: 'finance', label: 'Finance GL', href: '/finance', icon: '📊', section: 'Finance' },
  { id: 'invoices', label: 'AP / AR', href: '/finance/invoices', icon: '🧾', section: 'Finance' },
  { id: 'hr', label: 'Employees', href: '/hr', icon: '👥', section: 'People' },
  { id: 'payroll', label: 'Payroll', href: '/payroll', icon: '💰', section: 'People' },
  { id: 'supply', label: 'Supply Chain', href: '/supply-chain', icon: '📦', section: 'Operations' },
  { id: 'projects', label: 'Projects', href: '/projects', icon: '📋', section: 'Operations' },
  { id: 'bi', label: 'BI Dashboard', href: '/bi', icon: '📈', section: 'Intelligence' },
  { id: 'ai', label: 'AI Forecasting', href: '/ai-forecasting', icon: '🤖', section: 'Intelligence' },
  { id: 'audit', label: 'Audit Trail', href: '/audit', icon: '🔍', section: 'System' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️', section: 'System' },
];

const sections = ['Main', 'Finance', 'People', 'Operations', 'Intelligence', 'System'];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function handleLogout() {
    try { await auth.logout(); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  }

  const grouped = sections.reduce<Record<string, typeof navItems>>((acc, s) => {
    acc[s] = navItems.filter(i => i.section === s);
    return acc;
  }, {});

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        height: '100vh', flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at top left, rgba(0,229,160,0.06), transparent 70%)',
      }} />

      {/* Brand + collapse */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <div className="hex-clip" style={{
          width: 30, height: 30, background: 'var(--accent)', flexShrink: 0,
          display: 'grid', placeItems: 'center', color: '#000', fontWeight: 900, fontSize: 13,
        }}>A</div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em' }}>AMDOX ERP</div>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enterprise Suite</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          style={{
            marginLeft: 'auto', width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 12, display: 'grid', placeItems: 'center',
            transition: 'all 0.2s',
          }}
        >{collapsed ? '›' : '‹'}</button>
      </div>

      {/* Tenant badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
          >
            <div style={{
              margin: '10px 12px 4px', padding: '8px 12px', borderRadius: 8,
              background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.18)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
            }}>
              <span className="animate-pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                {user?.tenantName || 'NexaOps'}
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                {user?.role || 'Admin'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {sections.map(section => {
          const items = grouped[section];
          if (!items?.length) return null;
          return (
            <div key={section}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      padding: '12px 16px 4px', fontSize: 9, letterSpacing: '0.15em',
                      color: 'var(--text-dim)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
                    }}
                  >{section}</motion.div>
                )}
              </AnimatePresence>

              {items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link key={item.id} href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px' : '9px 16px',
                      fontSize: 12, textDecoration: 'none', position: 'relative',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeIndicator"
                        style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                          background: 'var(--accent)', borderRadius: '0 2px 2px 0',
                        }}
                      />
                    )}
                    <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                          style={{ overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400 }}
                        >{item.label}</motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px', flexShrink: 0 }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '8px' : '8px 4px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          borderRadius: 8, color: 'var(--text-muted)', fontSize: 12,
          transition: 'all 0.15s',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--blue))',
            display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#000',
          }}>
            {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }}
                style={{ flex: 1, minWidth: 0, overflow: 'hidden', textAlign: 'left' }}
              >
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sign out</div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
