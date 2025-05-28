import { generateInvoicePDF } from "@/lib/pdf-generator"
import { v2 as cloudinary } from "cloudinary"
import { type NextRequest, NextResponse } from "next/server"

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
      `/api/client/${billingData.clientId}`,
    )
    if (!clientResponse.ok) {
      throw new Error("Failed to fetch client data")
    }
    const clientData = await clientResponse.json()

    // Generate PDF
    let pdfBuffer: Buffer
    try {
      const pdf = generateInvoicePDF(billingData, clientData)
      pdfBuffer = Buffer.from(pdf.output("arraybuffer"))
      console.log("PDF generated successfully")
    } catch (error) {
      console.error("PDF generation error:", error)
      return NextResponse.json({ error: "Failed to generate PDF: " + (error as Error).message }, { status: 500 })
    }

    // Upload to Cloudinary
    try {
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

      console.log("PDF uploaded successfully")
      return NextResponse.json({ pdfUrl }, { status: 200 })

    } catch (error) {

      console.error("PDF upload error:", error)
      return NextResponse.json({ error: "Failed to upload PDF: " + (error as Error).message }, { status: 500 })
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF: " + (error as Error).message }, { status: 500 })
  }
}
