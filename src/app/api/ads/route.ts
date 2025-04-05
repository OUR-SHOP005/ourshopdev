import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdModel } from "@/lib/models";
import { AdRequestSchema } from "@/lib/types";
import { getAuth } from "@clerk/nextjs/server";

// GET handler - retrieve all ads with optional filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // Extract filter parameters
    const filters: Record<string, any> = {};

    // Add filtering for specific fields if provided in query params
    if (searchParams.has("title")) {
      filters.title = { $regex: searchParams.get("title"), $options: "i" };
    }

    if (searchParams.has("target.categories")) {
      filters["target.categories"] = {
        $in: [searchParams.get("target.categories")],
      };
    }

    if (searchParams.has("target.tags")) {
      filters["target.tags"] = { $in: [searchParams.get("target.tags")] };
    }

    if (searchParams.has("target.location")) {
      filters["target.location"] = searchParams.get("target.location");
    }

    // Date range filtering
    if (searchParams.has("dateFrom") && searchParams.has("dateTo")) {
      filters.created_at = {
        $gte: new Date(searchParams.get("dateFrom") as string),
        $lte: new Date(searchParams.get("dateTo") as string),
      };
    } else if (searchParams.has("dateFrom")) {
      filters.created_at = {
        $gte: new Date(searchParams.get("dateFrom") as string),
      };
    } else if (searchParams.has("dateTo")) {
      filters.created_at = {
        $lte: new Date(searchParams.get("dateTo") as string),
      };
    }

    // Sort options
    let sortOptions: Record<string, 1 | -1> = { created_at: -1 }; // Default sorting by created_at desc

    if (searchParams.has("sortBy")) {
      const sortBy = searchParams.get("sortBy");
      const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

      if (
        ["title", "impressions", "clicks", "created_at"].includes(
          sortBy as string
        )
      ) {
        sortOptions = { [sortBy as string]: sortOrder };
      }
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Execute query with all filters and options
    const ads = await AdModel.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await AdModel.countDocuments(filters);

    return NextResponse.json({
      ads,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

// POST handler - create a new ad
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await req.json();

    try {
      // Validate with Zod schema
      const validatedData = AdRequestSchema.parse(body);

      // Create ad with default values for non-provided fields
      const newAd = new AdModel({
        ...validatedData,
        impressions: 0,
        clicks: 0,
        created_at: new Date(),
      });

      // Save to database
      await newAd.save();

      return NextResponse.json(newAd, { status: 201 });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationError.errors || validationError.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
