import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdModel } from "@/lib/models";

// GET handler - get a random ad with optional targeting
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // Build targeting filters
    const filters: Record<string, any> = {};

    // Add targeting filters if provided in query params
    if (searchParams.has("category")) {
      filters["target.categories"] = { $in: [searchParams.get("category")] };
    }

    if (searchParams.has("tag")) {
      filters["target.tags"] = { $in: [searchParams.get("tag")] };
    }

    if (searchParams.has("location")) {
      filters["target.location"] = searchParams.get("location");
    }

    // First try to get an ad matching all targeting criteria
    let ads = await AdModel.aggregate([
      { $match: filters },
      { $sample: { size: 1 } }, // Get random document from the filtered set
    ]);

    // If no targeted ad found, fall back to a completely random ad
    if (!ads || ads.length === 0) {
      ads = await AdModel.aggregate([
        { $sample: { size: 1 } }, // Get any random ad
      ]);
    }

    // If still no ad found, return 404
    if (!ads || ads.length === 0) {
      return NextResponse.json({ error: "No ads available" }, { status: 404 });
    }

    return NextResponse.json(ads[0]);
  } catch (error) {
    console.error("Error fetching random ad:", error);
    return NextResponse.json(
      { error: "Failed to fetch random ad" },
      { status: 500 }
    );
  }
}
