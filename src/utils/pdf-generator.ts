import type { IBillingRecord, IClient } from "@/lib/types"
import jsPDF from "jspdf"

export function generateInvoicePDF(billingData: IBillingRecord, clientData: IClient): jsPDF {
  const doc = new jsPDF()

  // Company Header
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  doc.text("INVOICE", 20, 30)

  // Company Info (Right side)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Your Company Name", 140, 30)
  doc.text("123 Business Street", 140, 35)
  doc.text("City, State 12345", 140, 40)
  doc.text("contact@yourcompany.com", 140, 45)
  doc.text("+1 (555) 123-4567", 140, 50)

  // Invoice Details
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text(`Invoice #: ${billingData.invoiceNumber}`, 20, 60)
  doc.text(`Date: ${new Date(billingData.billDate || new Date()).toLocaleDateString()}`, 20, 67)
  doc.text(`Due Date: ${new Date(billingData.dueDate || new Date()).toLocaleDateString()}`, 20, 74)

  // Client Info
  doc.setFontSize(14)
  doc.text("Bill To:", 20, 90)
  doc.setFontSize(11)
  doc.text(clientData.name, 20, 97)
  if (clientData.companyName) {
    doc.text(clientData.companyName, 20, 104)
  }
  doc.text(clientData.email, 20, 111)
  if (clientData.phone) {
    doc.text(clientData.phone, 20, 118)
  }

  // Address
  if (clientData.address) {
    let yPos = 125
    if (clientData.address.street) {
      doc.text(clientData.address.street, 20, yPos)
      yPos += 7
    }
    if (clientData.address.city || clientData.address.state) {
      doc.text(`${clientData.address.city || ""} ${clientData.address.state || ""}`, 20, yPos)
      yPos += 7
    }
    if (clientData.address.country) {
      doc.text(clientData.address.country, 20, yPos)
    }
  }

  // Services Table Header
  const tableStartY = 160
  doc.setFillColor(240, 240, 240)
  doc.rect(20, tableStartY, 170, 10, "F")

  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text("Service", 25, tableStartY + 7)
  doc.text("Description", 70, tableStartY + 7)
  doc.text("Amount", 160, tableStartY + 7)

  // Services Table Content
  let currentY = tableStartY + 15
  billingData.servicesBilled?.forEach((service, index) => {
    doc.text(service.service, 25, currentY)
    doc.text(service.description || "", 70, currentY)
    doc.text(`${billingData.currency || "INR"} ${service.cost?.toLocaleString() || "0"}`, 160, currentY)
    currentY += 10
  })

  // Total
  doc.setDrawColor(200, 200, 200)
  doc.line(20, currentY + 5, 190, currentY + 5)

  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text("Total Amount:", 130, currentY + 15)
  doc.setFontSize(14)
  doc.text(`${billingData.currency || "INR"} ${billingData.amount.toLocaleString()}`, 160, currentY + 15)

  // Payment Status
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Payment Status: ${billingData.paymentStatus?.toUpperCase() || "UNPAID"}`, 20, currentY + 30)

  if (billingData.paymentMethod) {
    doc.text(`Payment Method: ${billingData.paymentMethod}`, 20, currentY + 37)
  }

  if (billingData.transactionId) {
    doc.text(`Transaction ID: ${billingData.transactionId}`, 20, currentY + 44)
  }

  // Notes
  if (billingData.notes) {
    doc.setFontSize(10)
    doc.text("Notes:", 20, currentY + 55)
    const splitNotes = doc.splitTextToSize(billingData.notes, 170)
    doc.text(splitNotes, 20, currentY + 62)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Thank you for your business!", 20, 280)

  return doc
}
