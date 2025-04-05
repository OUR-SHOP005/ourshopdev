import { NextResponse } from "next/server";
import { Blog } from "@/lib/models";
import connectDB from "@/lib/db";
import { BlogSchema } from "@/lib/types";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const publishedParam = searchParams.get("published");
    const featuredParam = searchParams.get("featured");
    // const isPublished = publishedParam === "true"; // Properly convert to boolean

    let query = {};
    if (slug) {
      query = { slug };
    } else {
      // Build query with filters
      if (publishedParam === "true") { 
        query = { ...query, isPublished: true };
      } else if (publishedParam === "false") {
        query = { ...query, isPublished: false };
      }
      
      // Add featured filter if provided
      if (featuredParam === "true") {
        query = { ...query, featured: true };
      }
    }

    const blogs = await Blog.find(query).sort({ publishedAt: -1 });

    // Log the results for debugging
    console.log('Found blogs:', blogs);

    if (!blogs || blogs.length === 0) {
      return NextResponse.json(blogs[0], { status: 200 }); // Return empty array instead of 404
    }

    return NextResponse.json(blogs);
  } catch (err: unknown) {
    console.error('Blog GET Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    try {
      const validatedData = BlogSchema.parse(body);
      const blogData = {
        ...validatedData,
        publishedAt: validatedData.isPublished ? new Date().toISOString() : undefined,
        // Set default featured image if none provided
        featuredImage: validatedData.featuredImage || "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1742598419/uploads/d9eqgzesei4wsgbb6mko.png"
      };
      
      const blog = await Blog.create(blogData);
      return NextResponse.json(blog, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Validation Error", errors: err.errors }, 
          { status: 400 }
        );
      }
      throw err;
    }
  } catch (err: unknown) {
    console.error('Blog POST Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err instanceof Error ? err.message : "Unknown error" }, 
      { status: 500 }
    );
  }
}
