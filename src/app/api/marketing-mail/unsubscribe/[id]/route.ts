import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingMail } from "@/lib/models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid subscriber ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the subscriber and update their consent status
    const subscriber = await MarketingMail.findById(id);

    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Set hasConsented to false
    subscriber.hasConsented = false;
    await subscriber.save();

    // Return subscriber info for confirmation page
    return NextResponse.json({
      message: "Successfully unsubscribed",
      email: subscriber.email,
      name: subscriber.name,
    });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscribe request" },
      { status: 500 }
    );
  }
}
