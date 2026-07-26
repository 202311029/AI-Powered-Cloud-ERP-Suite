import re

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add arrays to Tenant
if 'leaveRequests   LeaveRequest[]' not in schema:
    schema = schema.replace(
        '  payments        Payment[]\n}', 
        '  payments        Payment[]\n  leaveRequests   LeaveRequest[]\n  payrollRuns     PayrollRun[]\n  payrollSlips    PayrollSlip[]\n}'
    )

# Add arrays to Employee
if 'leaveRequests LeaveRequest[]' not in schema:
    schema = schema.replace(
        '  tenant      Tenant    @relation(fields: [tenantId], references: [id])\n}',
        '  tenant        Tenant        @relation(fields: [tenantId], references: [id])\n  leaveRequests LeaveRequest[]\n  payrollSlips  PayrollSlip[]\n}'
    )

append_models = """

model LeaveRequest {
  id          String   @id @default(uuid())
  employeeId  String
  startDate   DateTime
  endDate     DateTime
  status      String   @default("Pending") 
  tenantId    String
  createdAt   DateTime @default(now())

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  employee    Employee @relation(fields: [employeeId], references: [id])
}

model PayrollRun {
  id          String   @id @default(uuid())
  period      String   
  status      String   @default("Processing") 
  totalGross  Float    @default(0)
  totalNet    Float    @default(0)
  tenantId    String
  createdAt   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  slips       PayrollSlip[]
}

model PayrollSlip {
  id          String   @id @default(uuid())
  payrollRunId String
  employeeId  String
  grossPay    Float
  taxAmount   Float
  netPay      Float
  month       String
  tenantId    String
  createdAt   DateTime @default(now())

  tenant      Tenant      @relation(fields: [tenantId], references: [id])
  payrollRun  PayrollRun  @relation(fields: [payrollRunId], references: [id])
  employee    Employee    @relation(fields: [employeeId], references: [id])
}
"""

if 'model PayrollRun' not in schema:
    schema += append_models

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
