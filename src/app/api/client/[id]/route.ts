import { connectDB } from "@/lib/db"
import { BillingRecord, Client } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const client = await Client.findById(params.id)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Failed to fetch client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const clientData = await request.json()

    // Ensure updatedAt is set to current time
    clientData.updatedAt = new Date()

    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      clientData,
      { new: true, runValidators: true }
    )

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Failed to update client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    // First check if client exists
    const client = await Client.findById(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Delete associated billing records if any
    if (client.billingHistory && client.billingHistory.length > 0) {
      await BillingRecord.deleteMany({ _id: { $in: client.billingHistory } })
    }

    // Delete the client
    await Client.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Client and related records deleted successfully" })
  } catch (error) {
    console.error("Failed to delete client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
