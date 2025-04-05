import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdModel } from "@/lib/models";

// POST handler - increment impression count for an ad
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const id = (await params).id;
    // Check if ad exists
    const existingAd = await AdModel.findById(id);
    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Increment impression count
    const updatedAd = await AdModel.findByIdAndUpdate(
      id,
      { $inc: { impressions: 1 } }, // Increment impressions by 1
      { new: true } // Return updated document
    );

    return NextResponse.json(
      { success: true, impressions: updatedAd.impressions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking impression:", error);
    return NextResponse.json(
      { error: "Failed to track impression" },
      { status: 500 }
    );
  }
}
