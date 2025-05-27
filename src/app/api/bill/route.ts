import { type NextRequest, NextResponse } from "next/server"
import { mockBillingApi } from "@/lib/mock-billing-api"
import { mockApi } from "@/lib/mock-api"

export async function POST(request: NextRequest) {
  try {
    const billingData = await request.json()

    // Save billing record
    const savedBillingRecord = await mockBillingApi.saveBillingRecord(billingData)

    // Add billing record to client's billing history
    await mockApi.addBillingToClient(billingData.clientId, savedBillingRecord._id!)

    return NextResponse.json(savedBillingRecord, { status: 201 })
  } catch (error) {
    console.error("Billing save error:", error)
    return NextResponse.json({ error: "Failed to save billing record" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const billingRecords = await mockBillingApi.getAllBillingRecords()
    return NextResponse.json(billingRecords)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch billing records" }, { status: 500 })
  }
}
