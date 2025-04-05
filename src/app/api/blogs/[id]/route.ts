// import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Blog } from "@/lib/models";
import connectDB from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    await connectDB();
    const body = await request.json();

    // Handle publish status change
    if (body.isPublished && !body.publishedAt) {
      body.publishedAt = new Date().toISOString();
    }

    const blog = await Blog.findByIdAndUpdate((await params).id, body, {
      new: true,
    });

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (err: unknown) {
    console.error("Blog PUT Error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    await connectDB();
    const blog = await Blog.findByIdAndDelete((await params).id);

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err: unknown) {
    console.error(
      "Blog DELETE Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
