import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models";
import { ServiceSchema } from "@/lib/types";
import { getAuth } from "@clerk/nextjs/server";

// GET handler - fetch all services or a single service by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    await connectDB();

    if (id) {
      const service = await Service.findById(id);
      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(service);
    }

    const services = await Service.find().sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST handler - create a new service
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    // Check authentication
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = ServiceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid service data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newService = new Service({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedService = await newService.save();

    return NextResponse.json(savedService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
