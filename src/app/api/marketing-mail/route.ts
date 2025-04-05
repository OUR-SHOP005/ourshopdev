import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingMail } from "@/lib/models";
import { MarketingMailSchema } from "@/lib/types";
import { auth, currentUser } from "@clerk/nextjs/server";

// Check if user has already made a decision about marketing emails
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const existingConsent = await MarketingMail.findOne({ clerkId: userId });

    if (!existingConsent) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      hasConsented: existingConsent.hasConsented,
    });
  } catch (error) {
    console.error("Error checking marketing mail consent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Store user's consent for marketing emails
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = MarketingMailSchema.parse({
      clerkId: user.id,
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username || "User",
      email: user.emailAddresses[0]?.emailAddress || body.email,
      hasConsented: body.hasConsented,
      createdAt: new Date(),
    });

    await connectDB();

    // Check if entry already exists
    const existingConsent = await MarketingMail.findOne({ clerkId: user.id });

    if (existingConsent) {
      existingConsent.hasConsented = validatedData.hasConsented;
      await existingConsent.save();
      return NextResponse.json(existingConsent);
    }

    // Create new entry
    const newConsent = await MarketingMail.create(validatedData);

    return NextResponse.json(newConsent, { status: 201 });
  } catch (error) {
    console.error("Error creating marketing mail consent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
