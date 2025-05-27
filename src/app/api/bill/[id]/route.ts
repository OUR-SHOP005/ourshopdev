import { type NextRequest, NextResponse } from "next/server"
import { mockBillingApi } from "@/lib/mock-billing-api"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const updatedRecord = await mockBillingApi.updateBillingRecord(params.id, updates)
    return NextResponse.json(updatedRecord)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update billing record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await mockBillingApi.deleteBillingRecord(params.id)
    return NextResponse.json({ message: "Billing record deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete billing record" }, { status: 500 })
  }
}
