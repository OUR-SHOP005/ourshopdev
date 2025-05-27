import { type NextRequest, NextResponse } from "next/server"
import { mockApi } from "@/lib/mock-api"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const clientData = await request.json()
    const updatedClient = await mockApi.updateClient(params.id, clientData)
    return NextResponse.json(updatedClient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await mockApi.deleteClient(params.id)
    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await mockApi.getClient(params.id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}
