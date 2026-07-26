'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@nexaops.com');
  const [password, setPassword] = useState('Demo@2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Already logged in?
    if (localStorage.getItem('access_token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.login({ email, password });
      localStorage.setItem('access_token', res.accessToken);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,229,160,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(56,189,248,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {mounted && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, background: 'var(--accent)', borderRadius: 12,
              marginBottom: 16, fontSize: 20, fontWeight: 900, color: '#000',
              boxShadow: '0 0 24px rgba(0,229,160,0.3)',
            }}>A</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, fontFamily: 'var(--font-sans)' }}>Amdox ERP</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to your workspace</p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 32,
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14, outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  PASSWORD
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 14, outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                    color: '#f43f5e', fontSize: 13,
                  }}
                >{error}</motion.div>
              )}

              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                  background: loading ? 'rgba(0,229,160,0.5)' : 'var(--accent)',
                  color: '#000', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
                }}
              >
                {loading && <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            {/* Demo hint */}
            <div style={{
              marginTop: 20, padding: '10px 14px', borderRadius: 8,
              background: 'var(--accent-dim)', border: '1px solid rgba(0,229,160,0.15)',
              fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
              lineHeight: 1.6,
            }}>
              <strong>Demo credentials pre-filled</strong><br />
              admin@nexaops.com / Demo@2026!
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
