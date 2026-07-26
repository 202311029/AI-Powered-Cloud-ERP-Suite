with open('backend/prisma/schema.prisma', 'a', encoding='utf-8') as f:
    f.write('''
model Invoice {
  id             String   @id @default(uuid())
  type           String   
  status         String   @default("Draft") 
  vendorName     String
  totalAmount    Float
  quantity       Int?     @default(1)
  dueDate        DateTime
  ocrConfidence  Float?
  purchaseOrderId String?
  goodsReceiptId String?
  tenantId       String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant         Tenant         @relation(fields: [tenantId], references: [id])
  purchaseOrder  PurchaseOrder? @relation(fields: [purchaseOrderId], references: [id])
  goodsReceipt   GoodsReceipt?  @relation(fields: [goodsReceiptId], references: [id])
  payments       Payment[]
}

model GoodsReceipt {
  id               String   @id @default(uuid())
  purchaseOrderId  String
  receivedQuantity Int
  dateReceived     DateTime @default(now())
  tenantId         String

  tenant         Tenant        @relation(fields: [tenantId], references: [id])
  purchaseOrder  PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  invoices       Invoice[]
}

model Payment {
  id          String   @id @default(uuid())
  invoiceId   String
  amount      Float
  date        DateTime @default(now())
  tenantId    String

  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
}
''')
