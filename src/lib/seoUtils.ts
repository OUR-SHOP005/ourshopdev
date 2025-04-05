import { SEO } from "@/lib/models";
import { connectDB } from "@/lib/db";
import { Metadata } from "next";
import { ISEO } from "./types";
/**
 * Fetches SEO metadata for a given page path
 * @param pagePath The path of the page (e.g., /about, /blog)
 * @returns The SEO metadata for the page or null if not found
 */
export async function getSEOMetadata(pagePath: string): Promise<ISEO | null> {
  try {
    await connectDB();
    const seoData = await SEO.findOne({ pagePath });
    return seoData ? seoData : null;
  } catch (error) {
    console.error(`Error fetching SEO metadata for ${pagePath}:`, error);
    return null;
  }
}

/**
 * Generates Next.js metadata for a page based on SEO data
 * @param pagePath The path of the page
 * @param fallback Fallback metadata to use if no SEO entry is found
 * @returns Next.js Metadata object
 */
export async function generateMetadata(
  pagePath: string,
  fallback: Metadata
): Promise<Metadata> {
  const seoData = await getSEOMetadata(pagePath);

  if (!seoData) {
    return fallback;
  }

  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
  };

  // Add keywords if present
  if (seoData.keywords && seoData.keywords.length > 0) {
    metadata.keywords = seoData.keywords;
  }

  // Add openGraph data if present
  if (seoData.openGraph) {
    metadata.openGraph = {
      title: seoData.openGraph.title || seoData.title,
      description: seoData.openGraph.description || seoData.description,
      type: "website",
    };

    // Add OG images if present
    if (seoData.openGraph.images && seoData.openGraph.images.length > 0) {
      metadata.openGraph.images = seoData.openGraph.images;
    }
  }

  // Add robots directive if present
  if (seoData.robots) {
    metadata.robots = seoData.robots;
  }

  return metadata;
}

/**
 * Utility function to increment SEO entry view count (for analytics)
 * This is a placeholder for future analytics functionality
 */
export async function trackPageView(pagePath: string): Promise<void> {
  // This would typically update analytics data
  // For now, it's just a placeholder
  console.log(`Page view tracked for: ${pagePath}`);
}
