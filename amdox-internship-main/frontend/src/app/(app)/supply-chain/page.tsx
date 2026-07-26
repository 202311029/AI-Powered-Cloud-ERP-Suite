'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supply } from '@/lib/api';

const demoInventory = [
  { id: '1', sku: 'RAW-001', name: 'Carbon Steel Rods 10mm', category: 'Raw Material', unitPrice: 450, reorderLevel: 100, stockLevels: [{ quantity: 45, warehouse: { name: 'Main Warehouse' } }] },
  { id: '2', sku: 'FIN-012', name: 'Finished Gearbox Assembly', category: 'Finished Good', unitPrice: 12500, reorderLevel: 20, stockLevels: [{ quantity: 32, warehouse: { name: 'Main Warehouse' } }] },
  { id: '3', sku: 'PKG-001', name: 'Cardboard Box 30x20cm', category: 'Packaging', unitPrice: 25, reorderLevel: 500, stockLevels: [{ quantity: 1240, warehouse: { name: 'Secondary Warehouse' } }] },
  { id: '4', sku: 'ELC-007', name: 'HDMI Cable 2m Premium', category: 'Electronics', unitPrice: 380, reorderLevel: 30, stockLevels: [{ quantity: 12, warehouse: { name: 'Main Warehouse' } }] },
  { id: '5', sku: 'MFG-099', name: 'Bearing Kit 6202', category: 'Spare Part', unitPrice: 220, reorderLevel: 20, stockLevels: [{ quantity: 0, warehouse: { name: 'Main Warehouse' } }] },
  { id: '6', sku: 'CHM-045', name: 'Industrial Lubricant 5L', category: 'Chemical', unitPrice: 890, reorderLevel: 10, stockLevels: [{ quantity: 28, warehouse: { name: 'Main Warehouse' } }] },
];

export default function SupplyChainPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [tab, setTab] = useState<'inventory' | 'vendors' | 'po'>('inventory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [inv, v, p] = await Promise.all([supply.getInventory(), supply.getVendors(), supply.getPurchaseOrders()]);
        setInventory(inv); setVendors(v); setPos(p);
      } catch { setInventory(demoInventory); } finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📦 Supply Chain</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Inventory · Vendors · Purchase Orders</p>
        </div>
        <button id="new-po-btn" style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ New PO</button>
      </div>

      {/* Low stock alert banner */}
      {inventory.filter(i => i.stockLevels?.reduce((s: number, sl: any) => s + sl.quantity, 0) <= i.reorderLevel).length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          ⚠️ {inventory.filter(i => i.stockLevels?.reduce((s: number, sl: any) => s + sl.quantity, 0) <= i.reorderLevel).length} items below reorder level — review purchasing schedule
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {([['inventory', '📦 Inventory'], ['vendors', '🏭 Vendors'], ['po', '📋 Purchase Orders']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === k ? 'var(--accent)' : 'transparent', color: tab === k ? '#000' : 'var(--text-muted)', transition: 'all 0.15s' }}>{l}</button>
        ))}
      </div>

      {tab === 'inventory' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['SKU', 'Name', 'Category', 'Unit Price', 'Stock', 'Reorder At', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => {
                const stock = item.stockLevels?.reduce((s: number, sl: any) => s + sl.quantity, 0) ?? 0;
                const isLow = stock <= item.reorderLevel;
                const isOut = stock === 0;
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: isOut ? 'var(--danger)' : isLow ? '#f59e0b' : 'var(--text)' }}>{stock.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{item.reorderLevel}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)', fontWeight: 600, color: isOut ? 'var(--danger)' : isLow ? '#f59e0b' : 'var(--accent)', background: isOut ? 'rgba(244,63,94,0.1)' : isLow ? 'rgba(245,158,11,0.1)' : 'var(--accent-dim)' }}>
                        {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'OK'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'vendors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {(vendors.length ? vendors : [
            { id: '1', name: 'TechParts India Ltd', email: 'procurement@techparts.in', category: 'Electronics', gstNumber: '29ABCDE1234F1Z5', rating: 4.5 },
            { id: '2', name: 'Rajan Steel Works', email: 'orders@rajansteel.com', category: 'Raw Material', gstNumber: '27FGHIJ5678K2Y6', rating: 4.2 },
            { id: '3', name: 'PackPro Solutions', email: 'sales@packpro.co.in', category: 'Packaging', gstNumber: '33KLMNO9012L3X7', rating: 3.8 },
          ]).map((v: any, i: number) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              style={{ padding: '20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{v.email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: 'var(--blue-dim)', color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{v.category}</span>
                <span style={{ fontSize: 12, color: '#f59e0b' }}>{'★'.repeat(Math.round(v.rating || 4))}{'☆'.repeat(5 - Math.round(v.rating || 4))}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'po' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['PO Number', 'Vendor', 'Total', 'Status', 'Expected', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(pos.length ? pos : [
                { id: '1', poNumber: 'PO-2026-001', vendor: { name: 'TechParts India Ltd' }, totalAmount: 485000, status: 'Approved', expectedDate: '2026-08-15' },
                { id: '2', poNumber: 'PO-2026-002', vendor: { name: 'Rajan Steel Works' }, totalAmount: 1250000, status: 'Pending', expectedDate: '2026-08-22' },
                { id: '3', poNumber: 'PO-2026-003', vendor: { name: 'PackPro Solutions' }, totalAmount: 95000, status: 'Received', expectedDate: '2026-07-30' },
              ]).map((po: any, i: number) => {
                const statusColors: Record<string, string> = { Approved: 'var(--accent)', Pending: '#f59e0b', Received: 'var(--blue)', Cancelled: 'var(--danger)' };
                return (
                  <tr key={po.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{po.poNumber}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13 }}>{po.vendor?.name || po.vendorName}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)', color: statusColors[po.status] || 'var(--text)', background: `${statusColors[po.status]}18` }}>{po.status}</span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{po.expectedDate ? new Date(po.expectedDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      {po.status === 'Pending' && <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#000', cursor: 'pointer', fontWeight: 600 }}>Approve</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
