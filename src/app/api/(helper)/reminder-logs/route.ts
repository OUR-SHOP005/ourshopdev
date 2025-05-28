import { ReminderLog } from "@/lib/models"
import { connectDB } from "@/lib/db"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

// Get all reminder logs
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const reminderType = searchParams.get("reminderType")
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50

    // Build query based on provided filters
    const query: Record<string, any> = {}

    if (clientId) {
      query.clientId = new mongoose.Types.ObjectId(clientId)
    }

    if (reminderType) {
      query.reminderType = reminderType
    }

    const reminderLogs = await ReminderLog.find(query)
      .sort({ sentAt: -1 })
      .limit(limit)

    return NextResponse.json({ success: true, data: reminderLogs })
  } catch (error: any) {
    console.error("Failed to fetch reminder logs:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reminder logs" },
      { status: 500 }
    )
  }
}

// Create a new reminder log
export async function POST(request: Request) {
  try {
    await connectDB()

    const data = await request.json()

    // Validate required fields
    if (!data.clientId || !data.email || !data.reminderType || !data.message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const reminderLog = new ReminderLog({
      clientId: new mongoose.Types.ObjectId(data.clientId),
      email: data.email,
      reminderType: data.reminderType,
      message: data.message,
      status: data.status || "SENT",
      error: data.error,
      sentAt: data.sentAt || new Date()
    })

    await reminderLog.save()

    return NextResponse.json({ success: true, data: reminderLog })
  } catch (error: any) {
    console.error("Failed to create reminder log:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create reminder log" },
      { status: 500 }
    )
  }
} 