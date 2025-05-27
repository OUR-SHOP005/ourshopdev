import { connectDB } from "@/lib/db"
import { BillingRecord } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const billingRecord = await BillingRecord.findById((await params).id)

    if (!billingRecord) {
      return NextResponse.json({ error: "Billing record not found" }, { status: 404 })
    }

    return NextResponse.json(billingRecord)
  } catch (error) {
    console.error("Failed to fetch billing record:", error)
    return NextResponse.json({ error: "Failed to fetch billing record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const updates = await request.json()

    const updatedRecord = await BillingRecord.findByIdAndUpdate(
      (await params).id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!updatedRecord) {
      return NextResponse.json({ error: "Billing record not found" }, { status: 404 })
    }

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Failed to update billing record:", error)
    return NextResponse.json({ error: "Failed to update billing record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const deletedRecord = await BillingRecord.findByIdAndDelete((await params).id)

    if (!deletedRecord) {
      return NextResponse.json({ error: "Billing record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Billing record deleted successfully" })
  } catch (error) {
    console.error("Failed to delete billing record:", error)
    return NextResponse.json({ error: "Failed to delete billing record" }, { status: 500 })
  }
}
