// import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Portfolio } from "@/lib/models";
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
    const PortfolioId = (await params).id;
    await connectDB();
    const body = await request.json();
    const portfolio = await Portfolio.findByIdAndUpdate(PortfolioId, body, {
      new: true,
    });

    if (!portfolio) {
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (err: unknown) {
    console.error(
      "Portfolio PUT Error:",
      err instanceof Error ? err.message : err
    );
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

    const PortfolioId = (await params).id;
    await connectDB();
    const portfolio = await Portfolio.findByIdAndDelete(PortfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { message: "Portfolio not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Portfolio deleted successfully" });
  } catch (err: unknown) {
    console.error(
      "Portfolio DELETE Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
