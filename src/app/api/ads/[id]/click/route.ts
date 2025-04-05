import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdModel } from "@/lib/models";

// POST handler - increment click count for an ad
export async function POST(
  request: Request,
  { params }: { params:  Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const id = (await params).id;

    // Check if ad exists
    const existingAd = await AdModel.findById(id);
    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Increment click count
    const updatedAd = await AdModel.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } }, // Increment clicks by 1
      { new: true } // Return updated document
    );

    return NextResponse.json(
      { success: true, clicks: updatedAd.clicks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking click :", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
