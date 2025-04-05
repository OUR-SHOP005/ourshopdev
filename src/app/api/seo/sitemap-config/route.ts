import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { SitemapEntry } from "@/lib/types";

// Define the schema for sitemap entries
const SitemapEntrySchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, "URL is required"),
  changefreq: z.enum([
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ]),
  priority: z.number().min(0).max(1),
  lastmod: z.string().optional(),
});

// Define the schema for the sitemap configuration
const SitemapConfigSchema = z.object({
  entries: z.array(SitemapEntrySchema),
});

// Config file path
const configPath = path.join(process.cwd(), "src/config/sitemap-config.json");

// GET handler to retrieve sitemap configuration
export async function GET() {
  try {
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      // Return default configuration if file doesn't exist
      return NextResponse.json({
        entries: [
          {
            id: "home",
            url: "/",
            changefreq: "monthly",
            priority: 1.0,
          },
          {
            id: "about",
            url: "/about",
            changefreq: "monthly",
            priority: 0.8,
          },
          {
            id: "blog",
            url: "/blog",
            changefreq: "weekly",
            priority: 0.9,
          },
          {
            id: "portfolios",
            url: "/portfolios",
            changefreq: "monthly",
            priority: 0.9,
          },
          {
            id: "contact",
            url: "/contact",
            changefreq: "monthly",
            priority: 0.8,
          },
        ],
      });
    }

    // Read config file
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error retrieving sitemap configuration:", error);
    return NextResponse.json(
      { message: "Failed to retrieve sitemap configuration" },
      { status: 500 }
    );
  }
}

// PUT handler to update sitemap configuration
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
    const validationResult = SitemapConfigSchema.safeParse(body);
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

    // Process entries to ensure lastmod is set if missing
    const processedEntries = body.entries.map((entry: SitemapEntry) => ({
      ...entry,
      lastmod: entry.lastmod || new Date().toISOString(),
    }));

    // Write config to file
    fs.writeFileSync(
      configPath,
      JSON.stringify({ entries: processedEntries }, null, 2),
      "utf8"
    );

    return NextResponse.json({
      message: "Sitemap configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating sitemap configuration:", error);
    return NextResponse.json(
      { message: "Failed to update sitemap configuration" },
      { status: 500 }
    );
  }
}
