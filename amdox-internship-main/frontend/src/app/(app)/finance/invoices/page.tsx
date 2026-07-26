'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { finance } from '@/lib/api';

function fmt(n: number, currency: string = 'INR') {
  if (currency !== 'INR') return `${currency} ${n.toLocaleString()}`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const statusColors: Record<string, string> = {
  Draft: 'var(--text-muted)',
  Pending: '#f97316',
  Paid: 'var(--accent)',
  Overdue: 'var(--danger)',
};

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<'AP' | 'AR' | 'Aging'>('AP');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [agingReport, setAgingReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<'AP' | 'AR'>('AP');
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [dueDate, setDueDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Aging') {
        const report = await finance.getAgingReport();
        setAgingReport(report);
      } else {
        const data = await finance.getInvoices(activeTab);
        setInvoices(data);
      }
    } catch (error) {
      // Demo data
      if (activeTab === 'Aging') {
        setAgingReport({
          buckets: { '0-30': 50000, '31-60': 15000, '61-90': 5000, '90+': 2000 },
          total: 72000
        });
      } else {
        setInvoices([
          { id: '1', invoiceNumber: 'INV-1001', vendorName: 'Acme Corp', customerName: 'Acme Corp', totalAmount: 150000, currency: 'INR', status: 'Paid', dueDate: '2025-05-15' },
          { id: '2', invoiceNumber: 'INV-1002', vendorName: 'Globex Inc', customerName: 'Globex Inc', totalAmount: 25000, currency: 'INR', status: 'Pending', dueDate: '2025-06-20' },
          { id: '3', invoiceNumber: 'INV-1003', vendorName: 'Initech', customerName: 'Initech', totalAmount: 5000, currency: 'INR', status: 'Overdue', dueDate: '2025-01-10' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await finance.createInvoice({
        type: formType,
        vendorName,
        totalAmount: Number(totalAmount),
        currency,
        dueDate
      });
      setShowModal(false);
      resetForm();
      if (activeTab === formType) {
        await loadData();
      } else {
        setActiveTab(formType);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormType('AP');
    setVendorName('');
    setTotalAmount('');
    setCurrency('INR');
    setDueDate('');
  };

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🧾 Invoices</h1>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 10px' }}>AP / AR Management</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Manage Payables and Receivables
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13,
        }}>+ New Invoice</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {(['AP', 'AR', 'Aging'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: activeTab === tab ? 'var(--accent)' : 'transparent',
            color: activeTab === tab ? '#000' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>
            {tab === 'AP' ? 'Accounts Payable' : tab === 'AR' ? 'Accounts Receivable' : 'Aging Report'}
          </button>
        ))}
      </div>

      {activeTab !== 'Aging' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Invoice Number', activeTab === 'AP' ? 'Vendor' : 'Customer', 'Amount', 'Status', 'Due Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div style={{ height: 14, borderRadius: 4, background: 'var(--surface-2)', width: '60%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</td></tr>
              ) : invoices.map((inv, i) => (
                <motion.tr key={inv.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500 }}>{activeTab === 'AP' ? inv.vendorName : inv.customerName}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(inv.totalAmount, inv.currency)}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 20, color: statusColors[inv.status] || 'var(--text)', background: `${statusColors[inv.status] || '#fff'}18`, border: `1px solid ${statusColors[inv.status] || '#fff'}30` }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <button style={{ padding: '4px 8px', fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', cursor: 'pointer' }}>View</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Aging' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Aging Summary</h3>
          {loading ? (
             <div style={{ height: 20, width: '30%', background: 'var(--surface-2)', borderRadius: 4 }} />
          ) : agingReport ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
               {Object.entries(agingReport.buckets || {}).map(([bucket, amount]: any, i) => (
                 <motion.div key={bucket} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                   <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{bucket} Days</div>
                   <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmt(amount)}</div>
                 </motion.div>
               ))}
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'var(--accent-dim)', padding: 16, borderRadius: 8, border: '1px solid var(--accent)' }}>
                 <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8 }}>Total Outstanding</div>
                 <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{fmt(agingReport.total || 0)}</div>
               </motion.div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No aging data available.</p>
          )}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 500, width: '90%' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Create New Invoice</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Type</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value as 'AP' | 'AR')} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }}>
                  <option value="AP">Accounts Payable (AP)</option>
                  <option value="AR">Accounts Receivable (AR)</option>
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>{formType === 'AP' ? 'Vendor Name' : 'Customer Name'}</label>
                <input required value={vendorName} onChange={(e) => setVendorName(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Amount</label>
                   <input type="number" required value={totalAmount} onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                </div>
                <div style={{ width: 100 }}>
                   <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Currency</label>
                   <input required value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, color: 'var(--text-muted)' }}>Due Date</label>
                <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '8px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
