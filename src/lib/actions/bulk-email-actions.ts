"use server"

import { IBillingRecord, IClient } from "@/lib/types";
import { generateEmailContent } from "../ai-email-generator";

/**
 * Send reminder emails in bulk to clients with overdue invoices
 */
export async function sendBulkReminders(
  selectedRecords: IBillingRecord[],
  clients: IClient[]
) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const record of selectedRecords) {
    try {
      // Find the client
      const client = clients.find((c) => c._id === record.clientId);

      if (!client) {
        results.failed++;
        results.errors.push(`Client not found for invoice ${record.invoiceNumber}`);
        continue;
      }

      // Generate personalized email content with AI
      const emailContent = await generateEmailContent("PAYMENT_REMINDER", {
        clientName: client.name,
        companyName: client.companyName,
        invoiceNumber: record.invoiceNumber,
        amount: record.amount,
        currency: record.currency || "USD",
        dueDate: record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "ASAP",
      });

      // Send the email using our email API
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY || "",
        },
        body: JSON.stringify({
          to: client.email,
          subject: emailContent.subject,
          html: emailContent.body.replace(/\n/g, "<br>"),
          clientId: client._id,
          reminderType: "INVOICE_REMINDER",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reminder");
      }

      results.successful++;
    } catch (error: any) {
      console.error(`Failed to send reminder for invoice ${record.invoiceNumber}:`, error);
      results.failed++;
      results.errors.push(`${record.invoiceNumber}: ${error.message}`);
    }
  }

  return {
    success: results.successful > 0,
    summary: results,
    error: results.errors.length > 0 ? results.errors.join("; ") : undefined,
  };
}
