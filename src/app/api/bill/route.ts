import { connectDB } from "@/lib/db"
import { BillingRecord, Client } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const billingData = await request.json()

    // Generate PDF if not provided
    if (!billingData.billPdfUrl) {
      const pdfResponse = await fetch("/api/savebillingpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      })
      if (!pdfResponse.ok) {
        throw new Error("Failed to generate PDF")
      }
      billingData.billPdfUrl = (await pdfResponse.json()).pdfUrl
    }

    // Save billing record
    const savedBillingRecord = await BillingRecord.create(billingData)

    // Add billing record to client's billing history
    await Client.findByIdAndUpdate(
      billingData.clientId,
      { $push: { billingHistory: savedBillingRecord._id } }
    )

    return NextResponse.json(savedBillingRecord, { status: 201 })
  } catch (error) {
    console.error("Billing save error:", error)
    return NextResponse.json({ error: "Failed to save billing record" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)

    // Support filtering
    const query = {}

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const billingRecords = await BillingRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await BillingRecord.countDocuments(query)

    return NextResponse.json({
      data: billingRecords,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Failed to fetch billing records:", error)
    return NextResponse.json({ error: "Failed to fetch billing records" }, { status: 500 })
  }
}
