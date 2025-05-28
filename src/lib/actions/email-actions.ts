"use server"

import { Resend } from "resend"

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceReminder(
  clientId: string,
  invoiceId: string,
  clientEmail: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: Date,
) {
  try {
    const formattedDueDate = new Date(dueDate).toLocaleDateString()
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)

    const { data, error } = await resend.emails.send({
      from: "billing@yourcompany.com",
      to: clientEmail,
      subject: `Invoice Reminder: ${invoiceNumber}`,
      html: `
        <div>
          <h1>Invoice Payment Reminder</h1>
          <p>Dear ${clientName},</p>
          <p>This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} is due on ${formattedDueDate}.</p>
          <p>Please make your payment at your earliest convenience.</p>
          <p>Thank you for your business!</p>
          <p>Best regards,<br/>Your Company</p>
        </div>
      `,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send email" }
  }
}

export async function sendBulkInvoiceReminders(
  overdueInvoices: Array<{
    clientId: string
    invoiceId: string
    clientEmail: string
    clientName: string
    invoiceNumber: string
    amount: number
    currency: string
    dueDate: Date
  }>,
) {
  const results = []

  for (const invoice of overdueInvoices) {
    const result = await sendInvoiceReminder(
      invoice.clientId,
      invoice.invoiceId,
      invoice.clientEmail,
      invoice.clientName,
      invoice.invoiceNumber,
      invoice.amount,
      invoice.currency,
      invoice.dueDate,
    )

    results.push({
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      success: result.success,
      error: result.error,
    })
  }

  return results
}
