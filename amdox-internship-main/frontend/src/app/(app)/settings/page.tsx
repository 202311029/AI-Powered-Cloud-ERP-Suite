'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>⚙️ Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Account, notifications, and workspace preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--blue))', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800, color: '#000' }}>
            {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{user ? `${user.firstName} ${user.lastName}` : 'Loading...'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user?.email}</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{user?.role}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {['First Name', 'Last Name', 'Email', 'Phone'].map(f => (
            <div key={f}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{f.toUpperCase()}</label>
              <input defaultValue={f === 'First Name' ? user?.firstName : f === 'Last Name' ? user?.lastName : f === 'Email' ? user?.email : ''}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Workspace */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Workspace</div>
        {[['Tenant Name', 'NexaOps Manufacturing Pvt Ltd'], ['Domain', 'nexaops.com'], ['Timezone', 'Asia/Kolkata (IST)'], ['Currency', 'INR — Indian Rupee']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l}</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>{v}</span>
          </div>
        ))}
      </motion.div>

      {/* Notification prefs */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Notification Preferences</div>
        {[['Leave request approvals', true], ['Payroll completed', true], ['Low stock alerts', true], ['Invoice overdue', true], ['System maintenance', false]].map(([l, d]) => (
          <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13 }}>{l as string}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, background: d ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: d ? 18 : 4, transition: 'left 0.2s' }} />
            </div>
          </div>
        ))}
      </motion.div>

      <button id="save-settings-btn" onClick={handleSave} style={{ padding: '11px 28px', borderRadius: 8, border: 'none', background: saved ? 'var(--accent)' : 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
