import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SEO } from "@/lib/models";
import { SEOMetadataSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

// GET handler to retrieve a specific SEO entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const entry = await SEO.findById(id);
    if (!entry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to fetch SEO entry" },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing SEO entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();

    // Validate request body
    const validationResult = SEOMetadataSchema.safeParse({
      ...body,
      _id: id,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Check if entry exists
    const existingEntry = await SEO.findById(id);
    if (!existingEntry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    // Check if path conflicts with another entry
    if (body.pagePath !== existingEntry.pagePath) {
      const pathExists = await SEO.findOne({
        pagePath: body.pagePath,
        _id: { $ne: id },
      });

      if (pathExists) {
        return NextResponse.json(
          { message: "A SEO entry for this page path already exists" },
          { status: 409 }
        );
      }
    }

    // Update the entry
    const updatedEntry = await SEO.findByIdAndUpdate(
      id,
      {
        ...body,
        lastModified: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to update SEO entry" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a SEO entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deletedEntry = await SEO.findByIdAndDelete(id);
    if (!deletedEntry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "SEO entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to delete SEO entry" },
      { status: 500 }
    );
  }
}
