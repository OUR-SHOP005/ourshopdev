import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

/**
 * Generates the robots.txt file for the website
 * This follows the Robots Exclusion Standard
 * @see https://developers.google.com/search/docs/advanced/robots/create-robots-txt
 */
export default function robots(): MetadataRoute.Robots {
  // Config file path
  const configPath = path.join(process.cwd(), "src/config/robots-config.json");

  // Default configuration
  const DOMAIN =
    process.env.NEXT_PUBLIC_BASE_URL || "https://utkarshchaudhary.space";
  const defaultConfig = {
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
          "/services/",
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
    sitemap: `${DOMAIN}/sitemap.xml`,
    host: DOMAIN,
  };

  try {
    // Check if config file exists
    if (fs.existsSync(configPath)) {
      // Read config file
      const configData = fs.readFileSync(configPath, "utf8");
      const config = JSON.parse(configData);

      return {
        rules: config.rules,
        sitemap: config.sitemap,
        host: config.host,
      };
    }
  } catch (error) {
    console.error("Error reading robots.txt configuration:", error);
  }

  // Return default configuration if file doesn't exist or there's an error
  return defaultConfig;
}
