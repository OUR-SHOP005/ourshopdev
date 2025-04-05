import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingMail } from "@/lib/models";
import { checkRoleSupabase } from "@/utils/roles";

export async function GET() {
  try {
    // In a real application, you'd want to check if the user is an admin
    // For example:
    const isAdmin = await checkRoleSupabase("admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Get all marketing mail subscribers
    const marketingMails = await MarketingMail.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(marketingMails);
  } catch (error) {
    console.error("Error fetching marketing mail subscribers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
