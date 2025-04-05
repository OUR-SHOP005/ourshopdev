import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingMail } from "@/lib/models";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

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

    // Set hasConsented to true
    subscriber.hasConsented = true;
    await subscriber.save();

    return NextResponse.json({
      message: "Successfully resubscribed",
      email: subscriber.email,
      name: subscriber.name,
    });
  } catch (error) {
    console.error("Error resubscribing:", error);
    return NextResponse.json(
      { error: "Failed to process resubscribe request" },
      { status: 500 }
    );
  }
}
