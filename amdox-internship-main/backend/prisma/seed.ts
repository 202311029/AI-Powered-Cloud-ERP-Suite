import 'dotenv/config';
import { PrismaClient, AccountType, LineType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min: number, max: number, dec = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log('🌱 Seeding Amdox ERP — NexaOps demo tenant...');

  // ─── 1. Tenant ─────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'nexaops.com' },
    update: {},
    create: {
      name: 'NexaOps Manufacturing Pvt Ltd',
      domain: 'nexaops.com',
      plan: 'enterprise',
    },
  });
  console.log('✅ Tenant:', tenant.name);

  // ─── 2. Roles ──────────────────────────────────────────────────────────────
  const roles: Record<string, { id: string }> = {};
  for (const roleName of ['SuperAdmin', 'TenantAdmin', 'Manager', 'Employee', 'Viewer', 'Finance', 'HR']) {
    const r = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: roleName } },
      update: {},
      create: { name: roleName, tenantId: tenant.id },
    });
    roles[roleName] = r;
  }
  console.log('✅ Roles created');

  // ─── 3. Users ──────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo@2026!', 12);

  const usersData = [
    { email: 'admin@nexaops.com', firstName: 'Arjun', lastName: 'Sharma', role: 'SuperAdmin' },
    { email: 'ceo@nexaops.com', firstName: 'Priya', lastName: 'Mehta', role: 'TenantAdmin' },
    { email: 'cfo@nexaops.com', firstName: 'Vikram', lastName: 'Nair', role: 'Finance' },
    { email: 'hr@nexaops.com', firstName: 'Ananya', lastName: 'Patel', role: 'HR' },
    { email: 'ops@nexaops.com', firstName: 'Rohan', lastName: 'Gupta', role: 'Manager' },
    { email: 'finance2@nexaops.com', firstName: 'Sneha', lastName: 'Krishnan', role: 'Finance' },
  ];

  const users: Record<string, { id: string }> = {};
  for (const ud of usersData) {
    const user = await prisma.user.upsert({
      where: { email: ud.email },
      update: {},
      create: {
        email: ud.email,
        passwordHash,
        firstName: ud.firstName,
        lastName: ud.lastName,
      },
    });
    await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, roleId: roles[ud.role].id },
    });
    users[ud.email] = user;
  }
  console.log('✅ Users created');

  // ─── 4. Chart of Accounts ──────────────────────────────────────────────────
  const accounts: Record<string, { id: string }> = {};
  const accountsData = [
    { code: '1000', name: 'Cash & Bank', type: AccountType.Asset },
    { code: '1001', name: 'HDFC Current Account', type: AccountType.Asset },
    { code: '1100', name: 'Accounts Receivable', type: AccountType.Asset },
    { code: '1200', name: 'Inventory', type: AccountType.Asset },
    { code: '1300', name: 'Prepaid Expenses', type: AccountType.Asset },
    { code: '1400', name: 'Fixed Assets', type: AccountType.Asset },
    { code: '2000', name: 'Accounts Payable', type: AccountType.Liability },
    { code: '2100', name: 'Short-term Loans', type: AccountType.Liability },
    { code: '2200', name: 'Salary Payable', type: AccountType.Liability },
    { code: '2300', name: 'GST Payable', type: AccountType.Liability },
    { code: '3000', name: 'Share Capital', type: AccountType.Equity },
    { code: '3100', name: 'Retained Earnings', type: AccountType.Equity },
    { code: '4000', name: 'Product Revenue', type: AccountType.Revenue },
    { code: '4100', name: 'Service Revenue', type: AccountType.Revenue },
    { code: '5000', name: 'Cost of Goods Sold', type: AccountType.Expense },
    { code: '5100', name: 'Payroll Expense', type: AccountType.Expense },
    { code: '5200', name: 'Rent Expense', type: AccountType.Expense },
    { code: '5300', name: 'Marketing Expense', type: AccountType.Expense },
    { code: '5400', name: 'Utilities Expense', type: AccountType.Expense },
    { code: '5500', name: 'Depreciation', type: AccountType.Expense },
  ];

  for (const acc of accountsData) {
    const a = await prisma.account.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: acc.code } },
      update: {},
      create: { ...acc, tenantId: tenant.id },
    });
    accounts[acc.code] = a;
  }
  console.log('✅ Chart of Accounts created');

  // ─── 5. Financial Periods ──────────────────────────────────────────────────
  const periods = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const name = start.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const p = await prisma.financialPeriod.create({
      data: { name, startDate: start, endDate: end, isClosed: i > 0, tenantId: tenant.id },
    });
    periods.push(p);
  }
  console.log('✅ Financial periods created');

  // ─── 6. Journal Entries (sample GL) ───────────────────────────────────────
  const jeData = [
    { desc: 'Monthly Revenue Recognition', debitAcc: '1100', creditAcc: '4000', amount: 18500000, daysBack: 5 },
    { desc: 'Payroll June 2026', debitAcc: '5100', creditAcc: '2200', amount: 8200000, daysBack: 3 },
    { desc: 'Raw Material Purchase', debitAcc: '1200', creditAcc: '2000', amount: 4300000, daysBack: 8 },
    { desc: 'Rent Payment', debitAcc: '5200', creditAcc: '1001', amount: 350000, daysBack: 2 },
    { desc: 'GST Collection', debitAcc: '1100', creditAcc: '2300', amount: 3330000, daysBack: 5 },
    { desc: 'Equipment Purchase', debitAcc: '1400', creditAcc: '1001', amount: 2500000, daysBack: 15 },
    { desc: 'Marketing Campaign', debitAcc: '5300', creditAcc: '1001', amount: 750000, daysBack: 10 },
    { desc: 'Service Revenue', debitAcc: '1100', creditAcc: '4100', amount: 2800000, daysBack: 7 },
  ];

  for (const je of jeData) {
    const entry = await prisma.journalEntry.create({
      data: {
        description: je.desc,
        date: daysAgo(je.daysBack),
        currency: 'INR',
        status: 'Posted',
        tenantId: tenant.id,
      },
    });
    await prisma.journalLine.createMany({
      data: [
        { journalEntryId: entry.id, accountId: accounts[je.debitAcc].id, type: LineType.Debit, amount: je.amount, tenantId: tenant.id },
        { journalEntryId: entry.id, accountId: accounts[je.creditAcc].id, type: LineType.Credit, amount: je.amount, tenantId: tenant.id },
      ],
    });
  }
  console.log('✅ Journal entries created');

  // ─── 7. Currencies & FX Rates ──────────────────────────────────────────────
  await prisma.currency.upsert({ where: { code: 'INR' }, update: {}, create: { code: 'INR', name: 'Indian Rupee', symbol: '₹' } });
  await prisma.currency.upsert({ where: { code: 'USD' }, update: {}, create: { code: 'USD', name: 'US Dollar', symbol: '$' } });
  await prisma.currency.upsert({ where: { code: 'EUR' }, update: {}, create: { code: 'EUR', name: 'Euro', symbol: '€' } });
  await prisma.fxRate.create({ data: { baseCurrency: 'USD', quoteCurrency: 'INR', rate: 83.47, tenantId: tenant.id } });
  await prisma.fxRate.create({ data: { baseCurrency: 'EUR', quoteCurrency: 'INR', rate: 90.12, tenantId: tenant.id } });
  console.log('✅ Currencies & FX rates created');

  // ─── 8. Departments & Employees (30) ──────────────────────────────────────
  const departments = ['Engineering', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing', 'Quality', 'Procurement'];
  const designations = {
    Engineering: ['Senior Engineer', 'Software Engineer', 'Lead Engineer', 'Tech Architect'],
    Finance: ['Finance Manager', 'Accountant', 'Financial Analyst', 'Controller'],
    HR: ['HR Manager', 'HR Executive', 'Recruiter', 'HRBP'],
    Operations: ['Operations Manager', 'Plant Supervisor', 'Production Lead', 'Logistics Coordinator'],
    Sales: ['Sales Manager', 'Account Executive', 'Sales Rep', 'Business Dev Manager'],
    Marketing: ['Marketing Manager', 'Content Lead', 'Digital Marketer', 'Brand Exec'],
    Quality: ['QA Manager', 'Quality Inspector', 'QA Engineer', 'Compliance Officer'],
    Procurement: ['Procurement Manager', 'Purchase Executive', 'Buyer', 'Supply Chain Analyst'],
  };
  const firstNames = ['Aarav','Aisha','Arjun','Ananya','Bharat','Deepika','Ganesh','Harini','Ishaan','Kavya','Kiran','Lakshmi','Manish','Nisha','Omkar','Priya','Rahul','Riya','Sanjay','Sunita','Tarun','Uma','Vijay','Vandana','Yash','Zara','Amit','Pooja','Suresh','Meena'];
  const lastNames = ['Sharma','Patel','Nair','Gupta','Verma','Singh','Kumar','Rao','Mehta','Joshi','Iyer','Reddy','Pillai','Agarwal','Desai','Shah','Kapoor','Malhotra','Bose','Chakraborty'];

  const employees: { id: string; department: string }[] = [];
  const managerIds: Record<string, string> = {};

  for (let i = 0; i < 30; i++) {
    const dept = departments[i % departments.length];
    const desig = (designations as any)[dept][Math.floor(i / departments.length) % 4] || 'Executive';
    const isManager = desig.includes('Manager') || desig.includes('Lead') || desig.includes('Architect');
    const salary = isManager ? randomBetween(150000, 280000) : randomBetween(60000, 140000);
    const fn = firstNames[i];
    const ln = lastNames[i % lastNames.length];
    const emp = await prisma.employee.create({
      data: {
        employeeCode: `NEX-${String(i + 1001).padStart(4, '0')}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@nexaops.com`,
        department: dept,
        designation: desig,
        baseSalary: salary,
        hireDate: daysAgo(randomBetween(30, 1200)),
        employmentType: 'Full_Time',
        isActive: true,
        tenantId: tenant.id,
      },
    });
    employees.push({ id: emp.id, department: dept });
    if (isManager && !managerIds[dept]) managerIds[dept] = emp.id;
  }

  // Set manager relationships
  for (const emp of employees) {
    if (managerIds[emp.department] && managerIds[emp.department] !== emp.id) {
      await prisma.employee.update({ where: { id: emp.id }, data: { managerId: managerIds[emp.department] } });
    }
  }
  console.log('✅ Employees created (30)');

  // ─── 9. Leave Requests ─────────────────────────────────────────────────────
  const leaveTypes = ['Annual', 'Sick', 'Casual'];
  for (let i = 0; i < 15; i++) {
    const emp = employees[i % employees.length];
    const lt = leaveTypes[i % 3];
    await prisma.leaveRequest.create({
      data: {
        employeeId: emp.id,
        leaveType: lt,
        startDate: daysAgo(randomBetween(1, 30)),
        endDate: daysAgo(randomBetween(0, 0)),
        days: randomBetween(1, 3),
        status: i < 5 ? 'Pending' : i < 12 ? 'Approved' : 'Rejected',
        tenantId: tenant.id,
      },
    });
  }
  console.log('✅ Leave requests created');

  // ─── 10. Payroll Run ───────────────────────────────────────────────────────
  const payrollRun = await prisma.payrollRun.create({
    data: {
      period: 'June 2026',
      periodStart: new Date('2026-06-01'),
      periodEnd: new Date('2026-06-30'),
      status: 'Completed',
      totalGross: 0,
      totalNet: 0,
      employeeCount: employees.length,
      tenantId: tenant.id,
    },
  });

  let totalGross = 0, totalNet = 0;
  for (const emp of employees) {
    const empData = await prisma.employee.findUnique({ where: { id: emp.id } });
    const gross = empData?.baseSalary || 80000;
    const basic = gross * 0.5;
    const hra = gross * 0.2;
    const special = gross * 0.3;
    const pf = basic * 0.12;
    const esi = gross <= 21000 ? gross * 0.0075 : 0;
    const pt = 200;
    const deductions = pf + esi + pt;
    const net = gross - deductions;
    totalGross += gross;
    totalNet += net;
    await prisma.payslip.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: emp.id,
        period: 'June 2026',
        basicPay: basic,
        hra,
        specialAllowance: special,
        grossPay: gross,
        pfEmployee: pf,
        pfEmployer: pf,
        esiEmployee: esi,
        professionalTax: pt,
        totalDeductions: deductions,
        netPay: net,
        tenantId: tenant.id,
      },
    });
  }
  await prisma.payrollRun.update({ where: { id: payrollRun.id }, data: { totalGross, totalNet } });
  console.log('✅ Payroll run + payslips created');

  // ─── 11. Vendors (50) ──────────────────────────────────────────────────────
  const vendorNames = ['Tata Steel','Infosys BPO','Wipro Supplies','Reliance Industries','L&T Components','HCL Logistics','Mahindra Parts','Bajaj Electronics','Hero Moto Corp','BHEL Equipment','NTPC Cables','Coal India Materials','Hindustan Zinc','SAIL Components','Vedanta Copper','JSW Steel','Essar Oil','GAIL Industries','ONGC Services','Power Grid Corp','Adani Logistics','Godrej Industries','Pidilite Chemicals','Asian Paints','Berger Paints','Sika India','Henkel Adhesives','3M India','Bosch India','Siemens India','Honeywell India','ABB India','Schneider Electric','Legrand India','Havells India','Crompton Greaves','V-Guard Industries','Polycab India','KEI Industries','Finolex Cables','Sterlite Tech','Tejas Networks','HFCL Ltd','ITI Ltd','BEL Components','HAL Parts','BEML Ltd','Garden Reach','Mazagon Dock','Cochin Shipyard'];
  const vendors: { id: string; name: string }[] = [];
  for (let i = 0; i < 50; i++) {
    const v = await prisma.vendor.create({
      data: {
        code: `VND-${String(i + 1).padStart(3, '0')}`,
        name: vendorNames[i] || `Vendor ${i + 1}`,
        email: `procurement@vendor${i + 1}.com`,
        phone: `+91-${randomBetween(7000000000, 9999999999)}`,
        paymentTerms: ['Net30', 'Net45', 'Net60'][i % 3],
        rating: randomFloat(3.0, 5.0, 1),
        isActive: true,
        tenantId: tenant.id,
      },
    });
    vendors.push(v);
  }
  console.log('✅ Vendors created (50)');

  // ─── 12. Inventory Items (100 SKUs) ────────────────────────────────────────
  const warehouse = await prisma.warehouse.create({
    data: { code: 'WH-MAIN', name: 'Main Warehouse', location: 'Pune, Maharashtra', tenantId: tenant.id },
  });
  const warehouse2 = await prisma.warehouse.create({
    data: { code: 'WH-SOUTH', name: 'South Warehouse', location: 'Chennai, Tamil Nadu', tenantId: tenant.id },
  });

  const categories = ['Raw Materials', 'Components', 'Finished Goods', 'Packaging', 'Tools & Equipment', 'MRO'];
  const inventoryItems: { id: string; sku: string }[] = [];

  for (let i = 0; i < 100; i++) {
    const cat = categories[i % categories.length];
    const qty = randomBetween(0, 500);
    const cost = randomFloat(50, 50000, 2);
    const item = await prisma.inventoryItem.create({
      data: {
        sku: `NEX-SKU-${String(i + 1).padStart(4, '0')}`,
        name: `${cat} Item ${i + 1}`,
        category: cat,
        unitOfMeasure: ['pcs', 'kg', 'litre', 'meter', 'set'][i % 5],
        costPrice: cost,
        sellingPrice: cost * randomFloat(1.2, 1.8, 2),
        reorderLevel: randomBetween(10, 50),
        reorderQty: randomBetween(50, 200),
        tenantId: tenant.id,
      },
    });
    inventoryItems.push(item);
    await prisma.stockLevel.create({
      data: { inventoryItemId: item.id, warehouseId: warehouse.id, quantity: qty },
    });
    if (i % 3 === 0) {
      await prisma.stockLevel.create({
        data: { inventoryItemId: item.id, warehouseId: warehouse2.id, quantity: randomBetween(0, 100) },
      });
    }
  }
  console.log('✅ Inventory (100 SKUs) + stock levels created');

  // ─── 13. Purchase Orders (sample) ─────────────────────────────────────────
  const poStatuses = ['Draft', 'Approved', 'Ordered', 'Received', 'PartiallyReceived'] as const;
  for (let i = 0; i < 20; i++) {
    const vendor = vendors[i % vendors.length];
    const status = poStatuses[i % poStatuses.length];
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-2026-${String(i + 1).padStart(4, '0')}`,
        vendorId: vendor.id,
        status,
        currency: 'INR',
        totalAmount: randomFloat(100000, 5000000, 2),
        expectedDate: daysFromNow(randomBetween(7, 30)),
        tenantId: tenant.id,
      },
    });
    // Add PO lines
    const numLines = randomBetween(2, 5);
    for (let l = 0; l < numLines; l++) {
      const item = inventoryItems[randomBetween(0, inventoryItems.length - 1)];
      const qty = randomBetween(10, 100);
      const price = randomFloat(500, 10000, 2);
      await prisma.purchaseOrderLine.create({
        data: {
          purchaseOrderId: po.id,
          inventoryItemId: item.id,
          sku: item.sku,
          description: `${item.sku} procurement`,
          quantity: qty,
          unitPrice: price,
          totalPrice: qty * price,
        },
      });
    }
  }
  console.log('✅ Purchase orders created (20)');

  // ─── 14. AP Invoices ───────────────────────────────────────────────────────
  for (let i = 0; i < 30; i++) {
    const vendor = vendors[i % vendors.length];
    const statuses = ['Draft', 'Pending', 'Approved', 'Paid', 'Overdue'] as const;
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-AP-${String(i + 1).padStart(4, '0')}`,
        type: 'AP',
        status: statuses[i % statuses.length],
        vendorId: vendor.id,
        vendorName: vendor.name,
        totalAmount: randomFloat(50000, 2000000, 2),
        currency: 'INR',
        dueDate: i < 10 ? daysAgo(randomBetween(1, 30)) : daysFromNow(randomBetween(7, 60)),
        tenantId: tenant.id,
      },
    });
  }
  console.log('✅ AP Invoices created (30)');

  // ─── 15. Projects ──────────────────────────────────────────────────────────
  const projectsData = [
    { name: 'ERP Digital Transformation', status: 'Active', budget: 25000000 },
    { name: 'Factory Automation Phase 2', status: 'Active', budget: 18000000 },
    { name: 'New Product Line Launch', status: 'Planning', budget: 12000000 },
    { name: 'Supply Chain Optimization', status: 'Active', budget: 8000000 },
    { name: 'ISO 9001 Recertification', status: 'Completed', budget: 500000 },
    { name: 'Warehouse Management System', status: 'OnHold', budget: 6000000 },
  ];

  for (const pd of projectsData) {
    const project = await prisma.project.create({
      data: {
        name: pd.name,
        status: pd.status as any,
        startDate: daysAgo(randomBetween(30, 120)),
        endDate: daysFromNow(randomBetween(30, 180)),
        tenantId: tenant.id,
      },
    });

    // Budget
    await prisma.budget.create({
      data: {
        projectId: project.id,
        name: `${pd.name} Budget`,
        amount: pd.budget,
        spent: pd.budget * randomFloat(0.1, 0.7, 2),
        tenantId: tenant.id,
      },
    });

    // Milestones
    const milestoneNames = ['Kickoff & Planning', 'Design Phase', 'Development', 'Testing & QA', 'Go Live'];
    for (let m = 0; m < 3; m++) {
      const ms = await prisma.milestone.create({
        data: {
          projectId: project.id,
          name: milestoneNames[m],
          dueDate: daysFromNow(randomBetween(7, 90)),
          status: m === 0 ? 'Completed' : m === 1 ? 'InProgress' : 'Pending',
          tenantId: tenant.id,
        },
      });

      // Tasks per milestone
      for (let t = 0; t < 3; t++) {
        await prisma.task.create({
          data: {
            projectId: project.id,
            milestoneId: ms.id,
            name: `Task ${t + 1} for ${milestoneNames[m]}`,
            status: m === 0 ? 'Done' : t === 0 ? 'InProgress' : 'Todo',
            priority: ['Low', 'Medium', 'High', 'Critical'][t % 4],
            estimatedHours: randomBetween(8, 40),
            startDate: daysAgo(randomBetween(5, 30)),
            endDate: daysFromNow(randomBetween(5, 30)),
            tenantId: tenant.id,
          },
        });
      }
    }
  }
  console.log('✅ Projects + milestones + tasks created');

  // ─── 16. Demand Forecasts (sample) ────────────────────────────────────────
  for (let i = 0; i < 20; i++) {
    const item = inventoryItems[i];
    for (let d = 0; d < 3; d++) {
      await prisma.demandForecast.create({
        data: {
          inventoryItemId: item.id,
          forecastDate: daysFromNow((d + 1) * 30),
          predictedDemand: randomFloat(50, 500, 0),
          safetyStock: randomFloat(20, 100, 0),
          mapeEstimate: randomFloat(4.5, 11.9, 1),
          modelUsed: 'prophet',
          confidence: randomFloat(0.82, 0.96, 2),
          tenantId: tenant.id,
        },
      });
    }
  }
  console.log('✅ Demand forecasts seeded');

  // ─── 17. Audit Logs ────────────────────────────────────────────────────────
  const auditActions = ['LOGIN', 'INVOICE_CREATED', 'EMPLOYEE_UPDATED', 'PAYROLL_RUN', 'PO_APPROVED', 'REPORT_EXPORTED'];
  const adminUserId = users['admin@nexaops.com'].id;
  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        action: auditActions[i % auditActions.length],
        entity: 'System',
        entityId: `entity-${i}`,
        userId: adminUserId,
        tenantId: tenant.id,
        createdAt: daysAgo(randomBetween(0, 30)),
      },
    });
  }
  console.log('✅ Audit logs seeded');

  // ─── 18. Notifications ────────────────────────────────────────────────────
  const adminUser = users['admin@nexaops.com'];
  const notifMessages = [
    { title: '🚨 Low Stock Alert', message: 'NEX-SKU-0042 below reorder level (8 units remaining)', type: 'Warning' as const },
    { title: '✅ Payroll Completed', message: 'June 2026 payroll processed for 30 employees', type: 'Success' as const },
    { title: '📄 Invoice Overdue', message: 'INV-AP-0005 from Tata Steel is 15 days overdue', type: 'Error' as const },
    { title: '🧠 Forecast Ready', message: 'AI demand forecast updated for 20 SKUs', type: 'Info' as const },
    { title: '📊 Budget Alert', message: 'Factory Automation project at 68% of budget', type: 'Warning' as const },
  ];

  for (const msg of notifMessages) {
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        tenantId: tenant.id,
        title: msg.title,
        message: msg.message,
        type: msg.type,
        channel: 'InApp',
      },
    });
  }
  console.log('✅ Notifications seeded');

  console.log('\n🎉 Seeding complete! Login: admin@nexaops.com / Demo@2026!');
  console.log(`   Tenant: ${tenant.name} (${tenant.domain})`);
  console.log(`   Employees: 30 | Vendors: 50 | SKUs: 100 | Projects: 6`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
