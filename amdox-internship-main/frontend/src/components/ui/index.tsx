import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/* ---- KPI Card ---- */
interface KpiCardProps {
  icon: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  accent?: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow' | 'teal';
}

const accentMap = {
  green: 'var(--accent)',
  blue: 'var(--blue)',
  purple: 'var(--purple)',
  orange: 'var(--orange)',
  red: 'var(--danger)',
  yellow: 'var(--warning)',
  teal: 'var(--teal)',
};

export function KpiCard({ icon, label, value, change, changeType = 'up', accent = 'green' }: KpiCardProps) {
  const color = accentMap[accent];
  return (
    <div className="card card-hover relative overflow-hidden p-5 animate-slide-up">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-2xl font-black mb-1.5" style={{ fontFamily: 'var(--font-sans)' }}>{value}</div>
      {change && (
        <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
             style={{
               background: changeType === 'up' ? 'rgba(0,229,160,0.1)' : changeType === 'down' ? 'rgba(244,63,94,0.1)' : 'rgba(100,116,139,0.1)',
               color: changeType === 'up' ? 'var(--accent)' : changeType === 'down' ? 'var(--danger)' : 'var(--text-muted)',
             }}>
          {change}
        </div>
      )}
    </div>
  );
}

/* ---- Card ---- */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('card mb-5', className)} {...props}>
      {children}
    </div>
  );
}

/* ---- CardHeader ---- */
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function CardHeader({ title, subtitle, children }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-sans)' }}>{title}</div>
        {subtitle && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/* ---- Badge ---- */
interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange';
}

const badgeVariants = {
  green: { bg: 'rgba(0,229,160,0.1)', color: 'var(--accent)' },
  blue: { bg: 'rgba(56,189,248,0.1)', color: 'var(--blue)' },
  red: { bg: 'rgba(244,63,94,0.1)', color: 'var(--danger)' },
  yellow: { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)' },
  purple: { bg: 'rgba(167,139,250,0.1)', color: 'var(--purple)' },
  orange: { bg: 'rgba(249,115,22,0.1)', color: 'var(--orange)' },
};

export function Badge({ children, variant = 'green' }: BadgeProps) {
  const { bg, color } = badgeVariants[variant];
  return (
    <span className="badge" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

/* ---- Button ---- */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
  loading?: boolean;
}

export function Button({ variant = 'ghost', size = 'md', children, className, ...props }: ButtonProps) {
  const styles = {
    accent: { background: 'var(--accent)', color: '#000', border: '1px solid var(--accent)', fontFamily: 'var(--font-sans)', fontWeight: 700 },
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' },
    danger: { background: 'transparent', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.3)' },
  };
  const pad = size === 'sm' ? '4px 10px' : '8px 16px';
  return (
    <button
      className={cn('rounded-lg text-xs cursor-pointer transition-all hover:opacity-90 font-mono', className)}
      style={{ ...styles[variant], padding: pad, fontFamily: 'var(--font-mono)' }}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---- DataTable ---- */
interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
}

export function DataTable<T extends Record<string, unknown>>({ columns, data, keyField = 'id' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ background: 'var(--bg)' }}>
            {columns.map(col => (
              <th key={col.key} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest border-b font-medium"
                  style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={String(row[keyField] ?? i)} className="transition-colors hover:bg-white/[0.02] group">
              {columns.map(col => (
                <td key={col.key} className="px-5 py-3 text-xs border-b"
                    style={{ color: 'var(--text)', borderColor: 'rgba(26,34,53,0.5)' }}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Tab Bar ---- */
interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-0.5 p-1 rounded-xl border w-fit mb-5"
         style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      {tabs.map(tab => (
        <button key={tab}
          onClick={() => onChange(tab)}
          className="px-4 py-1.5 rounded-lg text-xs transition-all"
          style={active === tab
            ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,229,160,0.2)' }
            : { color: 'var(--text-muted)', border: '1px solid transparent' }
          }>
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ---- Progress Bar ---- */
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = 'var(--accent)', height = 5 }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: 'var(--border)' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
