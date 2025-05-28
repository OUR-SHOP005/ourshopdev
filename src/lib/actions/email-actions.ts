"use server"

import { Resend } from "resend"
import { generateEmailContent } from '../ai-email-generator'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an invoice reminder email to a client
 */
export async function sendInvoiceReminder(
  clientId: string,
  invoiceId: string,
  email: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  dueDate: Date
) {
  try {
    // Generate personalized email content with AI
    const emailContent = await generateEmailContent('PAYMENT_REMINDER', {
      clientName,
      invoiceNumber,
      amount,
      currency,
      dueDate: new Date(dueDate).toLocaleDateString(),
    })

    // Send the email using our email API
    const response = await fetch('/api/(helper)/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_KEY || '',
      },
      body: JSON.stringify({
        to: email,
        subject: emailContent.subject,
        html: emailContent.body.replace(/\n/g, '<br>'),
        clientId,
        reminderType: 'INVOICE_REMINDER',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send reminder')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Invoice reminder error:', error)
    return { success: false, error: error.message || 'Failed to send reminder' }
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
