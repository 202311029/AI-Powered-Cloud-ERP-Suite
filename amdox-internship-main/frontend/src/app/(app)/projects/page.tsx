'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { projects as projectsApi } from '@/lib/api';

const statusColors: Record<string, string> = {
  Active: 'var(--accent)', Planning: 'var(--blue)', OnHold: '#f59e0b',
  Completed: 'var(--text-muted)', Cancelled: 'var(--danger)',
};

const demoProjects = [
  { id: '1', name: 'ERP Implementation Phase 2', status: 'Active', budget: 5000000, startDate: '2026-04-01', endDate: '2026-09-30', _count: { tasks: 24, assignments: 5 }, milestones: [{ name: 'Design', status: 'Done' }, { name: 'Development', status: 'InProgress' }, { name: 'Testing', status: 'Pending' }] },
  { id: '2', name: 'Warehouse Automation', status: 'Planning', budget: 2500000, startDate: '2026-08-01', endDate: '2026-12-31', _count: { tasks: 12, assignments: 3 }, milestones: [] },
  { id: '3', name: 'Q3 Marketing Campaign', status: 'Active', budget: 800000, startDate: '2026-07-01', endDate: '2026-09-30', _count: { tasks: 8, assignments: 4 }, milestones: [{ name: 'Content Creation', status: 'Done' }, { name: 'Launch', status: 'InProgress' }] },
  { id: '4', name: 'ISO 9001 Certification', status: 'OnHold', budget: 350000, startDate: '2026-05-01', endDate: '2027-01-31', _count: { tasks: 18, assignments: 6 }, milestones: [] },
];

const fmt = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(1)}L` : `₹${n?.toLocaleString('en-IN')}`;

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', status: 'Planning', startDate: '', endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    projectsApi.getProjects().then(setProjectList).catch(() => setProjectList(demoProjects)).finally(() => setLoading(false));
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newProj = await projectsApi.createProject(formData);
      setProjectList([newProj, ...projectList]);
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'Planning', startDate: '', endDate: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>📋 Projects</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{projectList.filter(p => p.status === 'Active').length} active · {projectList.length} total</p>
        </div>
        <button id="new-project-btn" onClick={() => setShowModal(true)} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ New Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {loading ? [...Array(4)].map((_, i) => <div key={i} style={{ height: 200, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />) :
          projectList.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              style={{ padding: '22px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, flex: 1, marginRight: 10 }}>{p.name}</h3>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0, color: statusColors[p.status] || 'var(--text)', background: `${statusColors[p.status] || 'var(--text)'}18` }}>{p.status}</span>
              </div>

              {/* Budget */}
              {p.budget && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
                  Budget: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(p.budget)}</span>
                </div>
              )}

              {/* Milestones */}
              {p.milestones?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Milestones</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.milestones.map((m: any) => (
                      <span key={m.name} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontFamily: 'var(--font-mono)', background: m.status === 'Done' ? 'var(--accent-dim)' : m.status === 'InProgress' ? 'rgba(56,189,248,0.1)' : 'var(--surface-2)', color: m.status === 'Done' ? 'var(--accent)' : m.status === 'InProgress' ? 'var(--blue)' : 'var(--text-muted)', border: `1px solid ${m.status === 'Done' ? 'rgba(0,229,160,0.2)' : m.status === 'InProgress' ? 'rgba(56,189,248,0.2)' : 'var(--border)'}` }}>
                        {m.status === 'Done' ? '✓' : m.status === 'InProgress' ? '◐' : '○'} {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{p._count?.tasks || 0}</span> tasks
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{p._count?.assignments || 0}</span> members
                </div>
                {p.endDate && (
                  <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Due {new Date(p.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        }
      </div>
      
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 520, width: '90%' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Add New Project</h3>
            <form onSubmit={handleAddProject} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Project Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box', minHeight: 60 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Status</label>
                <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                  <option>Planning</option>
                  <option>Active</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: 'var(--accent)', color: '#000', fontWeight: 700, borderRadius: 8, padding: '10px 20px', border: 'none', cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Save Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
