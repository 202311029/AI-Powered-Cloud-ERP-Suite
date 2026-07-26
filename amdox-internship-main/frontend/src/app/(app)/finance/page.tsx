'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { finance } from '@/lib/api';

function fmt(n: number) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const typeColors: Record<string, string> = {
  Asset: 'var(--blue)', Liability: '#f97316', Equity: '#a78bfa',
  Revenue: 'var(--accent)', Expense: 'var(--danger)',
};

export default function FinancePage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [tab, setTab] = useState<'coa' | 'trial' | 'periods'>('coa');
  const [loading, setLoading] = useState(true);
  const [showJeModal, setShowJeModal] = useState(false);
  const [jeDescription, setJeDescription] = useState('');
  const [jeDate, setJeDate] = useState(new Date().toISOString().split('T')[0]);
  const [jeLines, setJeLines] = useState([
    { accountId: '', type: 'Debit', amount: 0 },
    { accountId: '', type: 'Credit', amount: 0 }
  ]);

  const load = async () => {
    try {
      const [a, tb, p] = await Promise.all([
        finance.getAccounts(),
        finance.getTrialBalance(),
        finance.getPeriods(),
      ]);
      setAccounts(a);
      setTrialBalance(tb);
      setPeriods(p);
    } catch { /* API offline - demo mode */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleJeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await finance.createJournalEntry({ description: jeDescription, date: jeDate, lines: jeLines });
      setShowJeModal(false);
      setJeDescription('');
      setJeDate(new Date().toISOString().split('T')[0]);
      setJeLines([{ accountId: '', type: 'Debit', amount: 0 }, { accountId: '', type: 'Credit', amount: 0 }]);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📊 Financial Ledger</h1>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 10px' }}>Financial Ledger</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Chart of Accounts · Journal Entries · Trial Balance
          </p>
        </div>
        <button id="new-je-btn" onClick={() => setShowJeModal(true)} style={{
          padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13,
        }}>+ Journal Entry</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {([['coa', 'Chart of Accounts'], ['trial', 'Trial Balance'], ['periods', 'Periods']] as const).map(([key, label]) => (
          <button key={key} id={`tab-${key}`} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === key ? 'var(--accent)' : 'transparent',
            color: tab === key ? '#000' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* COA */}
      {tab === 'coa' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Code', 'Account Name', 'Type', 'Sub-accounts'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div style={{ height: 14, borderRadius: 4, background: 'var(--surface-2)', width: j === 1 ? '60%' : '40%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : accounts.length === 0 ? (
                // Demo data
                [
                  { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', children: [] },
                  { code: '1100', name: 'Accounts Receivable', type: 'Asset', children: [{ code: '1101', name: 'Trade Debtors' }] },
                  { code: '2000', name: 'Accounts Payable', type: 'Liability', children: [] },
                  { code: '3000', name: 'Owner Equity', type: 'Equity', children: [] },
                  { code: '4000', name: 'Sales Revenue', type: 'Revenue', children: [{ code: '4001', name: 'Product Sales' }, { code: '4002', name: 'Service Revenue' }] },
                  { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', children: [] },
                  { code: '6000', name: 'Operating Expenses', type: 'Expense', children: [{ code: '6001', name: 'Salaries & Wages' }, { code: '6002', name: 'Rent' }] },
                ].map((a, i) => (
                  <motion.tr key={a.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.code}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 20, color: typeColors[a.type], background: `${typeColors[a.type]}18`, border: `1px solid ${typeColors[a.type]}30` }}>{a.type}</span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.children.length}</td>
                  </motion.tr>
                ))
              ) : accounts.map((a: any, i: number) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.code}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 20, color: typeColors[a.type], background: `${typeColors[a.type]}18`, border: `1px solid ${typeColors[a.type]}30` }}>{a.type}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.children?.length || 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trial Balance */}
      {tab === 'trial' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Trial Balance</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>As at {new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Code', 'Account', 'Type', 'Debit (₹)', 'Credit (₹)', 'Balance'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trialBalance.length === 0 ? (
                [
                  { code: '1000', name: 'Cash', type: 'Asset', debit: 2500000, credit: 800000 },
                  { code: '4000', name: 'Revenue', type: 'Revenue', debit: 0, credit: 4850000 },
                  { code: '5000', name: 'COGS', type: 'Expense', debit: 2100000, credit: 0 },
                  { code: '6001', name: 'Salaries', type: 'Expense', debit: 1800000, credit: 0 },
                  { code: '2000', name: 'Payables', type: 'Liability', debit: 0, credit: 750000 },
                ].map((r, i) => {
                  const balance = r.debit - r.credit;
                  return (
                    <tr key={r.code} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.code}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13 }}>{r.name}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, color: typeColors[r.type], background: `${typeColors[r.type]}15` }}>{r.type}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right' }}>{r.debit ? fmt(r.debit) : '—'}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right' }}>{r.credit ? fmt(r.credit) : '—'}</td>
                      <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right', color: balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>{fmt(Math.abs(balance))}</td>
                    </tr>
                  );
                })
              ) : trialBalance.map((r: any, i: number) => {
                const balance = r.debit - r.credit;
                return (
                  <tr key={r.code} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.code}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{r.name}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, color: typeColors[r.type], background: `${typeColors[r.type]}15` }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right' }}>{r.debit ? fmt(r.debit) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'right' }}>{r.credit ? fmt(r.credit) : '—'}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, textAlign: 'right', color: balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>{fmt(Math.abs(balance))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Periods */}
      {tab === 'periods' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {(periods.length ? periods : [
            { name: 'Q1 FY2025-26', startDate: '2025-04-01', endDate: '2025-06-30', isClosed: true },
            { name: 'Q2 FY2025-26', startDate: '2025-07-01', endDate: '2025-09-30', isClosed: true },
            { name: 'Q3 FY2025-26', startDate: '2025-10-01', endDate: '2025-12-31', isClosed: false },
            { name: 'Q4 FY2025-26', startDate: '2026-01-01', endDate: '2026-03-31', isClosed: false },
          ]).map((p: any, i: number) => (
            <motion.div key={p.name} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
              style={{ padding: '20px', borderRadius: 12, background: 'var(--surface)', border: `1px solid ${p.isClosed ? 'var(--border)' : 'rgba(0,229,160,0.2)'}` }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                {new Date(p.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(p.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-mono)', fontWeight: 600, color: p.isClosed ? 'var(--text-muted)' : 'var(--accent)', background: p.isClosed ? 'var(--surface-2)' : 'var(--accent-dim)', border: `1px solid ${p.isClosed ? 'var(--border)' : 'rgba(0,229,160,0.25)'}` }}>
                {p.isClosed ? '🔒 Closed' : '🟢 Open'}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Journal Entry Modal */}
      {showJeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 600, width: '90%' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New Journal Entry</h2>
            <form onSubmit={handleJeSubmit}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Description</label>
                  <input required value={jeDescription} onChange={e => setJeDescription(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Date</label>
                  <input type="date" required value={jeDate} onChange={e => setJeDate(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                </div>
              </div>
              
              <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-muted)' }}>Lines</label>
              {jeLines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input placeholder="Account ID" required value={line.accountId} onChange={e => { const newLines = [...jeLines]; newLines[i].accountId = e.target.value; setJeLines(newLines); }} style={{ flex: 2, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                  <select value={line.type} onChange={e => { const newLines = [...jeLines]; newLines[i].type = e.target.value as 'Debit' | 'Credit'; setJeLines(newLines); }} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }}>
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                  <input type="number" placeholder="Amount" required value={line.amount || ''} onChange={e => { const newLines = [...jeLines]; newLines[i].amount = Number(e.target.value); setJeLines(newLines); }} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                  {jeLines.length > 2 && (
                    <button type="button" onClick={() => { const newLines = jeLines.filter((_, idx) => idx !== i); setJeLines(newLines); }} style={{ padding: '8px 12px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>X</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setJeLines([...jeLines, { accountId: '', type: 'Debit', amount: 0 }])} style={{ marginBottom: 24, padding: '6px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>+ Add Line</button>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowJeModal(false)} style={{ padding: '8px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
