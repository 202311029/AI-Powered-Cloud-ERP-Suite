import re

with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add arrays to Tenant
if 'projects        Project[]' not in schema:
    schema = schema.replace(
        '  payrollSlips    PayrollSlip[]\n}', 
        '  payrollSlips    PayrollSlip[]\n  projects        Project[]\n  tasks           Task[]\n  timesheets      Timesheet[]\n}'
    )

# Add arrays to Employee
if 'timesheets    Timesheet[]' not in schema:
    schema = schema.replace(
        '  payrollSlips  PayrollSlip[]\n}',
        '  payrollSlips  PayrollSlip[]\n  timesheets    Timesheet[]\n}'
    )

append_models = """

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  budgetLimit Float
  spentAmount Float    @default(0)
  variance    Float    @default(0)
  tenantId    String
  createdAt   DateTime @default(now())

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  tasks       Task[]
  timesheets  Timesheet[]
}

model Task {
  id          String   @id @default(uuid())
  projectId   String
  name        String
  startDate   DateTime
  endDate     DateTime
  status      String   @default("Not_Started")
  tenantId    String

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  project     Project  @relation(fields: [projectId], references: [id])
}

model Timesheet {
  id          String   @id @default(uuid())
  projectId   String
  employeeId  String
  hours       Float
  date        DateTime
  isLocked    Boolean  @default(false)
  tenantId    String

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  project     Project  @relation(fields: [projectId], references: [id])
  employee    Employee @relation(fields: [employeeId], references: [id])
}
"""

if 'model Project' not in schema:
    schema += append_models

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
