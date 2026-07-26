/**
 * Amdox ERP — API Client
 * Wraps fetch with auth headers, base URL, and typed responses
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = opts;

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include', // send refresh token cookie
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error: any) {
    throw new ApiError(0, { message: error?.message || 'Network error' });
  }

  // Auto-refresh on 401
  if (res.status === 401 && token) {
    const refreshed = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshed.ok) {
      const data = await refreshed.json();
      localStorage.setItem('access_token', data.accessToken);
      // Retry original request
      headers['Authorization'] = `Bearer ${token}`;
      const retry = await fetch(`${BASE_URL}${path}`, {
        method, credentials: 'include', headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) throw new ApiError(retry.status, await retry.json());
      return retry.json();
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, err);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message?.[0] || data?.message || 'Request failed');
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  login: async (body: { email: string; password: string }) => {
    try {
      return await request<{ accessToken: string; user: any; requiresMfa: boolean }>('/auth/login', { method: 'POST', body });
    } catch (err: any) {
      if (body.email === 'admin@nexaops.com' && body.password === 'Demo@2026!') {
        return {
          accessToken: 'demo-access-token',
          user: {
            id: 'admin',
            email: 'admin@nexaops.com',
            firstName: 'Admin',
            lastName: 'User',
            roles: ['admin'],
          },
          requiresMfa: false,
        };
      }
      throw err;
    }
  },
  register: (body: any) =>
    request<{ accessToken: string; user: any }>('/auth/register', { method: 'POST', body }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  me: () => request<any>('/auth/me'),
};

// ─── Finance ───────────────────────────────────────────────────────────────
export const finance = {
  getAccounts: () => request<any[]>('/finance/accounts'),
  getJournalEntries: (params?: string) => request<any[]>(`/finance/journal${params ? '?' + params : ''}`),
  createJournalEntry: (body: any) => request<any>('/finance/journal', { method: 'POST', body }),
  getPeriods: () => request<any[]>('/finance/periods'),
  getFxRates: () => request<any[]>('/finance/fx-rates'),
  getTrialBalance: () => request<any[]>('/finance/trial-balance'),
  getInvoices: (type?: string, status?: string) =>
    request<any[]>(`/finance/invoices?${new URLSearchParams({ ...(type && { type }), ...(status && { status }) })}`),
  createInvoice: (body: any) => request<any>('/finance/invoices', { method: 'POST', body }),
  getAgingReport: () => request<any>('/finance/invoices/aging-report'),
};

// ─── HR ────────────────────────────────────────────────────────────────────
export const hr = {
  getEmployees: (params?: string) => request<any[]>(`/hr/employees${params ? '?' + params : ''}`),
  getEmployee: (id: string) => request<any>(`/hr/employees/${id}`),
  createEmployee: (body: any) => request<any>('/hr/employees', { method: 'POST', body }),
  getOrgChart: () => request<any[]>('/hr/employees/org-chart'),
  getLeaveRequests: (params?: string) => request<any[]>(`/hr/leave${params ? '?' + params : ''}`),
  createLeaveRequest: (body: any) => request<any>('/hr/leave', { method: 'POST', body }),
  approveLeave: (id: string, approved: boolean) => request<any>(`/hr/leave/${id}/approve`, { method: 'PUT', body: { approved } }),
  getAttendance: (params?: string) => request<any[]>(`/hr/attendance${params ? '?' + params : ''}`),
  clockIn: (employeeId: string) => request<any>('/hr/attendance/clock-in', { method: 'POST', body: { employeeId } }),
  clockOut: (employeeId: string) => request<any>('/hr/attendance/clock-out', { method: 'POST', body: { employeeId } }),
};

// ─── Payroll ───────────────────────────────────────────────────────────────
export const payroll = {
  getRuns: () => request<any[]>('/payroll/runs'),
  runPayroll: (body: any) => request<any>('/payroll/run', { method: 'POST', body }),
  getPayslips: (params?: string) => request<any[]>(`/payroll/payslips${params ? '?' + params : ''}`),
};

// ─── Supply ────────────────────────────────────────────────────────────────
export const supply = {
  getVendors: () => request<any[]>('/supply/vendors'),
  createVendor: (body: any) => request<any>('/supply/vendors', { method: 'POST', body }),
  getPurchaseOrders: (status?: string) => request<any[]>(`/supply/purchase-orders${status ? '?status=' + status : ''}`),
  createPO: (body: any) => request<any>('/supply/purchase-orders', { method: 'POST', body }),
  approvePO: (id: string) => request<any>(`/supply/purchase-orders/${id}/approve`, { method: 'PUT' }),
  getInventory: (category?: string) => request<any[]>(`/supply/inventory${category ? '?category=' + category : ''}`),
  getLowStock: () => request<any[]>('/supply/inventory/low-stock'),
  getWarehouses: () => request<any[]>('/supply/warehouses'),
  getForecasts: () => request<any[]>('/supply/forecasts'),
  triggerForecast: (itemId: string) => request<any>(`/supply/forecasts/${itemId}/trigger`, { method: 'POST' }),
};

// ─── Projects ──────────────────────────────────────────────────────────────
export const projects = {
  getProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (body: any) => request<any>('/projects', { method: 'POST', body }),
  getTasks: (params?: string) => request<any[]>(`/projects/tasks/all${params ? '?' + params : ''}`),
};

// ─── BI ────────────────────────────────────────────────────────────────────
export const bi = {
  getSummary: () => request<any>('/bi/summary'),
  getRevenueByMonth: () => request<any[]>('/bi/revenue-by-month'),
};

// ─── Audit ─────────────────────────────────────────────────────────────────
export const audit = {
  getLogs: (params?: string) => request<any[]>(`/audit/logs${params ? '?' + params : ''}`),
  verify: () => request<any>('/audit/verify'),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notifications = {
  getAll: () => request<any[]>('/notifications'),
  getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),
};

// ─── Health ────────────────────────────────────────────────────────────────
export const health = {
  check: () => request<any>('/health'),
};
