import { type NextRequest, NextResponse } from "next/server"
import { mockApi } from "@/lib/mock-api"

export async function GET() {
  try {
    const clients = await mockApi.getClients()
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientData = await request.json()
    const newClient = await mockApi.createClient(clientData)
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
