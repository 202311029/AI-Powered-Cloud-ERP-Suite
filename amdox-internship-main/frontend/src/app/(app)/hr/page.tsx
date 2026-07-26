'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { hr as hrApi } from '@/lib/api';

const demoEmployees = [
  { id: '1', employeeId: 'EMP-001', firstName: 'Arjun', lastName: 'Sharma', designation: 'Engineering Manager', department: 'Engineering', baseSalary: 180000, isActive: true },
  { id: '2', employeeId: 'EMP-002', firstName: 'Priya', lastName: 'Mehta', designation: 'Senior Developer', department: 'Engineering', baseSalary: 145000, isActive: true },
  { id: '3', employeeId: 'EMP-003', firstName: 'Rahul', lastName: 'Gupta', designation: 'Finance Analyst', department: 'Finance', baseSalary: 95000, isActive: true },
  { id: '4', employeeId: 'EMP-004', firstName: 'Sneha', lastName: 'Patel', designation: 'HR Manager', department: 'HR', baseSalary: 120000, isActive: true },
  { id: '5', employeeId: 'EMP-005', firstName: 'Vikram', lastName: 'Singh', designation: 'Supply Chain Lead', department: 'Operations', baseSalary: 130000, isActive: true },
  { id: '6', employeeId: 'EMP-006', firstName: 'Ananya', lastName: 'Das', designation: 'QA Engineer', department: 'Engineering', baseSalary: 85000, isActive: true },
];

const deptColors: Record<string, string> = {
  Engineering: 'var(--blue)', Finance: 'var(--accent)', HR: '#a78bfa',
  Operations: '#f97316', Marketing: '#ec4899', Sales: '#14b8a6',
};

export default function HrPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', department: 'Engineering',
    designation: '', baseSalary: '', phone: '', employmentType: 'Full_Time'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hrApi.getEmployees().then(setEmployees).catch(() => setEmployees(demoEmployees)).finally(() => setLoading(false));
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, baseSalary: Number(formData.baseSalary) };
      const newEmp = await hrApi.createEmployee(payload);
      setEmployees([newEmp, ...employees]);
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', email: '', department: 'Engineering', designation: '', baseSalary: '', phone: '', employmentType: 'Full_Time' });
    } catch (err) {
      console.error(err);
      alert('Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department)))];
  const filtered = employees.filter(e => {
    const matchSearch = !search || `${e.firstName} ${e.lastName} ${e.designation}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="animate-slide-up" style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>👥 Employees</h1>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: '6px 0 10px' }}>Employee Directory</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{employees.filter(e => e.isActive).length} active · {employees.filter(e => !e.isActive).length} inactive</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input id="emp-search" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none',
            fontFamily: 'var(--font-mono)',
          }} />
          <button id="add-employee-btn" onClick={() => setShowAddModal(true)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Add</button>
        </div>
      </div>

      {/* Dept filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {departments.map(d => (
          <button key={d} onClick={() => setDeptFilter(d)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12,
            background: deptFilter === d ? 'var(--accent)' : 'var(--surface)',
            color: deptFilter === d ? '#000' : 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
          }}>{d}</button>
        ))}
      </div>

      {/* Employee grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} style={{ height: 140, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }} />)
        ) : filtered.map((emp, i) => (
          <motion.div key={emp.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.2s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${deptColors[emp.department] || 'var(--blue)'}, ${deptColors[emp.department] || 'var(--accent)'}88)`,
                display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, color: '#000',
              }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{emp.firstName} {emp.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.designation}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, fontFamily: 'var(--font-mono)', color: deptColors[emp.department] || 'var(--blue)', background: `${deptColors[emp.department] || 'var(--blue)'}15` }}>
                {emp.department}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{emp.employeeId}</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: emp.isActive ? 'var(--accent)' : 'var(--text-dim)' }} />
              </div>
            </div>
            {emp.baseSalary && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Salary</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{emp.baseSalary.toLocaleString('en-IN')}/mo</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!loading && (
        <div style={{ marginTop: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['Employee ID', 'Name', 'Designation', 'Department', 'Status', 'Salary'].map(header => (
                  <th key={header} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{emp.employeeId}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{emp.firstName} {emp.lastName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{emp.designation}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12 }}>{emp.department}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: emp.isActive ? 'var(--accent)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{emp.isActive ? 'Active' : 'Inactive'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>₹{emp.baseSalary?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 520, width: '90%' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Add New Employee</h3>
            <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>First Name</label>
                <input required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Last Name</label>
                <input required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Department</label>
                <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                  <option>Engineering</option>
                  <option>Finance</option>
                  <option>HR</option>
                  <option>Operations</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Designation</label>
                <input required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Base Salary</label>
                <input type="number" required value={formData.baseSalary} onChange={e => setFormData({ ...formData, baseSalary: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--text-muted)' }}>Employment Type</label>
                <select required value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '8px 14px', fontSize: 13, width: '100%', boxSizing: 'border-box' }}>
                  <option>Full_Time</option>
                  <option>Part_Time</option>
                  <option>Contract</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: 'var(--accent)', color: '#000', fontWeight: 700, borderRadius: 8, padding: '10px 20px', border: 'none', cursor: 'pointer' }}>{submitting ? 'Saving...' : 'Save Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

