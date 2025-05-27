import { connectDB } from "@/lib/db"
import { Client } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)

    // Support filtering by status
    const status = searchParams.get('status')
    const query = status ? { status } : {}

    // Support searching
    const search = searchParams.get('search')
    if (search) {
      Object.assign(query, {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ]
      })
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Client.countDocuments(query)

    return NextResponse.json({
      data: clients,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const clientData = await request.json()

    // Add default values
    if (!clientData.createdAt) clientData.createdAt = new Date()
    if (!clientData.updatedAt) clientData.updatedAt = new Date()

    const newClient = await Client.create(clientData)
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Failed to create client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
