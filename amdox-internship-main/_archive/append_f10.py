with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add array to Tenant for AuditLogs
if 'auditLogs       AuditLog[]' not in schema:
    schema = schema.replace(
        '  timesheets      Timesheet[]\n}', 
        '  timesheets      Timesheet[]\n  auditLogs       AuditLog[]\n}'
    )

append_models = """

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  entity    String
  entityId  String
  userId    String
  details   Json?
  tenantId  String
  createdAt DateTime @default(now())

  tenant    Tenant   @relation(fields: [tenantId], references: [id])
}
"""

if 'model AuditLog' not in schema:
    schema += append_models

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
