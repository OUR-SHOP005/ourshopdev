import { NextResponse } from "next/server";
import { Portfolio } from "@/lib/models";
import connectDB from "@/lib/db";
import { PortfolioRequestSchema } from "@/lib/types";
import { z } from "zod";
// import { auth } from "@clerk/nextjs";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Query parameters
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const technology = searchParams.get("technology");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Debug: Log all search parameters to help diagnose the issue
    console.log("Search parameters:", {
      slug,
      category,
      status,
      technology,
      featured,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    const removeAllFromString = (str: string | null): string => {
      return str ? str.replace("all", "") : "";
    };

    // Helper function to check if string has meaningful value
    const hasValue = (str: string | null): boolean => {
      return str !== null && str.trim() !== "" && str !== "all";
    };

    // Build query
    const query: {
      slug?: string;
      category?: string;
      status?: string;
      technologies?: string | string[] | RegExp;
      featured?: boolean;
    } = {};

    if (slug && hasValue(slug)) query.slug = slug;
    if (category && hasValue(category))
      query.category = removeAllFromString(category);
    if (status && hasValue(status)) query.status = removeAllFromString(status);
    if (technology && hasValue(technology)) {
      const techValue = removeAllFromString(technology);
      // Use regex for partial matching of technologies
      query.technologies = new RegExp(techValue, "i");
    }
    if (featured === "true") query.featured = true;

    // Debug: Log the final query to see what we're actually searching for
    console.log("MongoDB query:", JSON.stringify(query));

    // Handle pagination and sorting
    const skip = (page - 1) * limit;
    const sort: { [key: string]: 1 | -1 } = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    let [portfolios, total] = await Promise.all([
      Portfolio.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-embeddings"),
      Portfolio.countDocuments(query),
    ]);

    // Debug: Log the count of results
    console.log(`Found ${portfolios.length} portfolios matching the query`);

    // If no results, check if there are any portfolios in the database at all
    if (portfolios.length === 0) {
      const totalportfolios = await Portfolio.countDocuments({});
      console.log(`Total portfolios in database: ${totalportfolios}`);
    }

    if (slug && portfolios.length === 0) {
      portfolios = [
        {
          title: "Portfolio not found",
          slug: "",
          description: "",
          excerpt: "",
          content: "",
          category: "",
          status: "planned",
          technologies: [],
          githubUrl: "",
          liveUrl: "",
          featuredImage: "",
          gallery: [],
          startDate: "",
          endDate: "",
          markdown: true,
          featured: false,
        },
      ];
      total = 1;
    }

    // Return response with pagination metadata
    return NextResponse.json({
      portfolios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.log("error in server:");
    console.log(err);
    console.error(
      "Portfolio GET Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    try {
      // Convert date strings to Date objects before validation

      // Validate data with Zod
      const validatedData = PortfolioRequestSchema.parse(body);

      // Check for duplicate slug
      const existingPortfolio = await Portfolio.findOne({
        slug: validatedData.slug,
      });
      if (existingPortfolio) {
        return NextResponse.json(
          {
            message: `A Portfolio with slug "${validatedData.slug}" already exists`,
          },
          { status: 409 }
        );
      }

      // Create Portfolio
      const portfolio = await Portfolio.create({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json(portfolio, { status: 201 });
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log("Validation Error", err.errors);
        return NextResponse.json(
          { message: "Validation Error", errors: err.errors },
          { status: 400 }
        );
      }

      // Handle MongoDB duplicate key error more gracefully
      if (
        err instanceof Error &&
        err.message.includes("E11000 duplicate key error")
      ) {
        const match = err.message.match(/dup key: { (\w+): "([^"]+)" }/);
        const field = match?.[1] || "unknown field";
        const value = match?.[2] || "unknown value";

        return NextResponse.json(
          {
            message: `A Portfolio with this ${field} already exists: "${value}"`,
          },
          { status: 409 }
        );
      }

      throw err;
    }
  } catch (err: unknown) {
    console.error(
      "Portfolio POST Error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        message: "Internal Server Error",
        details: err instanceof Error ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
