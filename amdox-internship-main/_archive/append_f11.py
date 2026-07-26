with open('backend/prisma/schema.prisma', 'r', encoding='utf-8') as f:
    schema = f.read()

# Add array to Tenant for Webhooks and Notifications
if 'webhookSubscriptions WebhookSubscription[]' not in schema:
    schema = schema.replace(
        '  leads           Lead[]\n}', 
        '  leads           Lead[]\n  webhookSubscriptions WebhookSubscription[]\n}'
    )

if 'userPreferences    UserPreference?' not in schema:
    schema = schema.replace(
        '  notifications Notification[]\n}',
        '  notifications Notification[]\n  userPreferences UserPreference?\n}'
    )

append_models = """

model UserPreference {
  id               String   @id @default(uuid())
  userId           String   @unique
  emailEnabled     Boolean  @default(true)
  smsEnabled       Boolean  @default(false)
  pushEnabled      Boolean  @default(true)
  tenantId         String

  user             User     @relation(fields: [userId], references: [id])
}

model WebhookSubscription {
  id        String   @id @default(uuid())
  url       String
  event     String   // e.g. "INVOICE_CREATED", "PAYROLL_COMPLETED"
  isActive  Boolean  @default(true)
  tenantId  String
  createdAt DateTime @default(now())

  tenant    Tenant   @relation(fields: [tenantId], references: [id])
}
"""

if 'model WebhookSubscription' not in schema:
    schema += append_models

with open('backend/prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
