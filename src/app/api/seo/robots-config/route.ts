import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";
import { z } from "zod";

// Define validation schema for robots.txt config
const RobotsConfigSchema = z.object({
  host: z.string().url("Domain must be a valid URL"),
  rules: z.array(
    z.object({
      userAgent: z.string(),
      allow: z.array(z.string()).optional(),
      disallow: z.array(z.string()).optional(),
    })
  ),
  sitemap: z.string().url("Sitemap URL must be valid").optional(),
});

// Config file path
const configPath = path.join(process.cwd(), "src/config/robots-config.json");

// GET handler to retrieve robots.txt configuration
export async function GET() {
  try {
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      // Return default configuration if file doesn't exist
      return NextResponse.json({
        host:
          process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.space",
        rules: [
          {
            userAgent: "*",
            allow: [
              "/",
              "/home/",
              "/about/",
              "/contact/",
              "/blog/",
              "/portfolios/",
            ],
            disallow: [
              "/api/",
              "/(Auth)/",
              "/sign-in/",
              "/sign-up/",
              "/admin/",
              "/_next/",
              "/private/",
              "/*.json$",
            ],
          },
        ],
        sitemap: `${
          process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.space"
        }/sitemap.xml`,
      });
    }

    // Read config file
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error retrieving robots.txt configuration:", error);
    return NextResponse.json(
      { message: "Failed to retrieve robots.txt configuration" },
      { status: 500 }
    );
  }
}

// PUT handler to update robots.txt configuration
export async function PUT(request: NextRequest) {
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
    const validationResult = RobotsConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const dirPath = path.dirname(configPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write config to file
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2), "utf8");

    return NextResponse.json({
      message: "Robots.txt configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating robots.txt configuration:", error);
    return NextResponse.json(
      { message: "Failed to update robots.txt configuration" },
      { status: 500 }
    );
  }
}
