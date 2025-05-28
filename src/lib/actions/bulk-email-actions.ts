"use server"

import { sendBulkInvoiceReminders } from "./email-actions"

export async function sendBulkReminders(
  overdueInvoices: Array<{
    _id?: string
    clientId: string
    invoiceNumber: string
    amount: number
    currency?: string
    dueDate?: Date
  }>,
  clients: Array<{
    _id?: string
    name: string
    email: string
  }>,
) {
  try {
    const emailData = overdueInvoices.map((invoice) => {
      const client = clients.find((c) => c._id === invoice.clientId)

      if (!client) {
        throw new Error(`Client not found for invoice ${invoice.invoiceNumber}`)
      }

      return {
        clientId: invoice.clientId,
        invoiceId: invoice._id || "",
        clientEmail: client.email,
        clientName: client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        currency: invoice.currency || "USD",
        dueDate: invoice.dueDate || new Date(),
      }
    })

    const results = await sendBulkInvoiceReminders(emailData)

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send bulk reminders",
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
      },
    }
  }
}
