import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SEO } from "@/lib/models";
import { SEOMetadataSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

// GET handler to retrieve all SEO entries
export async function GET() {
  try {
    await connectDB();
    const entries = await SEO.find({}).sort({ pagePath: 1 });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching SEO entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch SEO entries" },
      { status: 500 }
    );
  }
}

// POST handler to create a new SEO entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Validate request body
    const validationResult = SEOMetadataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if page path already exists
    const existing = await SEO.findOne({ pagePath: body.pagePath });
    if (existing) {
      return NextResponse.json(
        { message: "A SEO entry for this page path already exists" },
        { status: 409 }
      );
    }

    // Create new SEO entry
    const newEntry = await SEO.create({
      ...body,
      lastModified: new Date(),
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to create SEO entry" },
      { status: 500 }
    );
  }
}
