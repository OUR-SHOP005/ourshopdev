import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { billingData, clientData, pdfUrl } = await request.json()

    // Download PDF from Cloudinary
    const pdfResponse = await fetch(pdfUrl)
    const pdfBuffer = await pdfResponse.arrayBuffer()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${billingData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .invoice-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .services-table th, .services-table td { border: 1px solid #dee2e6; padding: 12px; text-align: left; }
            .services-table th { background: #f8f9fa; }
            .total { font-size: 18px; font-weight: bold; color: #28a745; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ${billingData.invoiceNumber}</h1>
              <p>Dear ${clientData.name},</p>
              <p>Please find attached your invoice for the services provided. Below are the details:</p>
            </div>
            
            <div class="invoice-details">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${billingData.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(billingData.billDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(billingData.dueDate).toLocaleDateString()}</p>
              <p><strong>Amount:</strong> ${billingData.currency || "INR"} ${billingData.amount.toLocaleString()}</p>
              <p><strong>Status:</strong> ${billingData.paymentStatus?.toUpperCase() || "UNPAID"}</p>
            </div>

            <h3>Services Provided</h3>
            <table class="services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${
                  billingData.servicesBilled
                    ?.map(
                      (service: any) => `
                  <tr>
                    <td>${service.service}</td>
                    <td>${service.description || ""}</td>
                    <td>${billingData.currency || "INR"} ${service.cost?.toLocaleString() || "0"}</td>
                  </tr>
                `,
                    )
                    .join("") || ""
                }
              </tbody>
            </table>

            <div class="total">
              <p>Total Amount: ${billingData.currency || "INR"} ${billingData.amount.toLocaleString()}</p>
            </div>

            ${
              billingData.notes
                ? `
              <div style="margin-top: 20px;">
                <h4>Notes:</h4>
                <p>${billingData.notes}</p>
              </div>
            `
                : ""
            }

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>If you have any questions about this invoice, please contact us.</p>
              <p>
                <strong>Your Company Name</strong><br>
                Email: contact@yourcompany.com<br>
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "invoice <onboarding@resend.dev>",
      to: [clientData.email],
      subject: `Invoice ${billingData.invoiceNumber} - ${clientData.companyName || clientData.name}`,
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${billingData.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
        },
      ],
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
