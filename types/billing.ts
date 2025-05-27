export interface ServiceBilled {
  service: "design" | "development" | "SEO" | "maintenance" | "hosting" | "domain" | "analytics" | "ecommerce" | "other"
  description?: string
  cost?: number
}

export interface BillingRecord {
  _id?: string
  clientId: string
  invoiceNumber: string
  amount: number
  currency?: string
  servicesBilled?: ServiceBilled[]
  billDate?: Date
  dueDate?: Date
  paymentStatus?: "paid" | "unpaid" | "overdue" | "cancelled"
  paymentMethod?: string
  transactionId?: string
  notes?: string
  billPdfUrl: string
  createdAt?: Date
  updatedAt?: Date
}
