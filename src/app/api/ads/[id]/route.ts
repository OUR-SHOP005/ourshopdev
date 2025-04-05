import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdModel } from "@/lib/models";
import { AdSchema } from "@/lib/types";
import { getAuth } from "@clerk/nextjs/server";

// GET handler - get a specific ad by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const id = (await params).id;

    const ad = await AdModel.findById(id);

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}

// PATCH handler - update an existing ad
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const id = (await params).id;

    // Check if ad exists
    const existingAd = await AdModel.findById(id);
    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();

    try {
      // Can't update impressions or clicks from this endpoint - those are handled by separate endpoints
      delete body.impressions;
      delete body.clicks;
      delete body.created_at;

      // Partial validation of provided fields
      const validatedData = AdSchema.partial().parse(body);

      // Update ad
      const updatedAd = await AdModel.findByIdAndUpdate(
        id,
        { $set: validatedData },
        { new: true } // Return the updated document
      );

      return NextResponse.json(updatedAd);
    } catch (validationError: unknown) {
      const error = validationError as Error & { errors?: unknown };
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors || error.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

// DELETE handler - delete an ad
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const id = (await params).id;

    // Check if ad exists before deletion
    const existingAd = await AdModel.findById(id);
    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Delete the ad
    await AdModel.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Ad deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
