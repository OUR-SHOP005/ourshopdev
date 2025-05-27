import { type NextRequest, NextResponse } from "next/server"
import { generateInvoicePDF } from "@/lib/pdf-generator"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const billingData = await request.json()

    // Get client data
    const clientResponse = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3000"}/api/client/${billingData.clientId}`,
    )
    if (!clientResponse.ok) {
      throw new Error("Failed to fetch client data")
    }
    const clientData = await clientResponse.json()

    // Generate PDF
    const pdf = generateInvoicePDF(billingData, clientData)
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "invoices",
            public_id: `invoice-${billingData.invoiceNumber}-${Date.now()}`,
            format: "pdf",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(pdfBuffer)
    })

    const pdfUrl = (uploadResult as any).secure_url

    return NextResponse.json({ pdfUrl }, { status: 200 })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
