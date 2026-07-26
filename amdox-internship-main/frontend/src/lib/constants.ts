// Amdox ERP — Design Token Types
export const colors = {
  bg: '#060810',
  surface: '#0d1117',
  surface2: '#111827',
  surface3: '#161d2b',
  border: '#1a2235',
  borderLight: '#243048',
  accent: '#00e5a0',
  accentDim: 'rgba(0,229,160,0.10)',
  accentGlow: 'rgba(0,229,160,0.25)',
  blue: '#38bdf8',
  blueDim: 'rgba(56,189,248,0.10)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  orange: '#f97316',
  teal: '#14b8a6',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#334155',
  danger: '#f43f5e',
  warning: '#f59e0b',
} as const;

export type Color = keyof typeof colors;

// Module definitions
export const modules = [
  { id: 'dashboard', label: 'Overview', icon: '⬡', href: '/dashboard' },
  { id: 'finance', label: 'General Ledger', icon: '📒', href: '/finance', section: 'Finance' },
  { id: 'payables', label: 'Accounts Payable', icon: '📤', href: '/finance/payables', badge: '3', badgeColor: 'warning', section: 'Finance' },
  { id: 'receivables', label: 'Accounts Receivable', icon: '📥', href: '/finance/receivables', section: 'Finance' },
  { id: 'hr', label: 'HR & Employees', icon: '👥', href: '/hr', section: 'People' },
  { id: 'payroll', label: 'Payroll', icon: '💰', href: '/payroll', badge: 'RUN', badgeColor: 'green', section: 'People' },
  { id: 'supply-chain', label: 'Supply Chain', icon: '🔗', href: '/supply-chain', section: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: '📦', href: '/supply-chain/inventory', badge: '!', section: 'Operations' },
  { id: 'projects', label: 'Projects', icon: '📐', href: '/projects', section: 'Operations' },
  { id: 'ai-forecasting', label: 'AI Forecasting', icon: '🧠', href: '/ai-forecasting', section: 'Intelligence' },
  { id: 'bi-dashboard', label: 'BI Dashboards', icon: '📊', href: '/bi', section: 'Intelligence' },
  { id: 'audit', label: 'Audit Logs', icon: '🗂', href: '/audit', section: 'System' },
  { id: 'api-docs', label: 'API Reference', icon: '📖', href: '/api-docs', section: 'System' },
  { id: 'webhooks', label: 'Webhooks', icon: '⚓', href: '/settings?tab=API+%26+Webhooks', section: 'System' },
  { id: 'settings', label: 'Settings', icon: '⚙', href: '/settings', section: 'System' },
] as const;

export type ModuleId = typeof modules[number]['id'];
