with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add array to Tenant for CRM
if 'leads           Lead[]' not in schema:
    schema = schema.replace(
        '  auditLogs       AuditLog[]\n}', 
        '  auditLogs       AuditLog[]\n  leads           Lead[]\n}'
    )

append_models = """

model Lead {
  id               String   @id @default(uuid())
  companyName      String
  contactName      String?
  status           String   @default("Prospect") // Prospect, Qualified, Closed_Won, Closed_Lost
  estimatedValue   Float    @default(0)
  score            Float?   // Predicted by AI
  tenantId         String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  tenant           Tenant   @relation(fields: [tenantId], references: [id])
}
"""

if 'model Lead' not in schema:
    schema += append_models

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
