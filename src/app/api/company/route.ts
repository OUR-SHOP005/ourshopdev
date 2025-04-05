import { NextRequest, NextResponse } from "next/server";
import { CompanyInfo } from "@/lib/models";
import { connectDB } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { companyInfoSchema } from "@/lib/types";
import { checkRoleSupabase } from "@/utils/roles";

// GET - Fetch company information
export async function GET() {
  try {
    await connectDB();

    // Check if company info exists
    let companyInfo = await CompanyInfo.findOne();

    // If no company info exists, create default
    if (!companyInfo) {
      companyInfo = await CompanyInfo.create({
        company_name: "Your Company",
        tagline: "Your Company Tagline",
        description: "Your company description goes here.",
        email: "info@yourcompany.com",
        location: "Company Location",
        stories: [],
        socialLinks: [],
        team: [],
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error fetching company information:", error);
    return NextResponse.json(
      { error: "Failed to fetch company information" },
      { status: 500 }
    );
  }
}

// POST - Update company information
export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    // Check authentication
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const isAdmin = await checkRoleSupabase("admin");

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log(body);
    const modifiedData = await CompanyInfo.create({
      ...body,
      updatedAt: new Date(body.updatedAt),
    });
    // Basic validation
    const validationResult = companyInfoSchema.safeParse(modifiedData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid company data",
          details: validationResult.error.flatten(),
          data: body,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if company info exists
    let companyInfo = await CompanyInfo.findOne();

    if (companyInfo) {
      // Update existing record
      companyInfo = await CompanyInfo.findOneAndUpdate(
        {},
        { ...body, updatedAt: new Date() },
        { new: true }
      );
    } else {
      // Create new record
      companyInfo = await CompanyInfo.create({
        ...body,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("Error updating company information:", error);
    return NextResponse.json(
      { error: "Failed to update company information" },
      { status: 500 }
    );
  }
}
