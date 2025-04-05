import { Metadata, ResolvingMetadata } from "next";
import ClientPortfolioDetail from "./client";

// Function to fetch Portfolio data for metadata
async function getPortfolioData(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/portfolio?slug=${slug}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.portfolios?.[0] || null;
  } catch (error) {
    console.error("Error fetching Portfolio data for metadata:", error);
    return null;
  }
}

// Dynamic metadata generation
export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the Portfolio data
  const Portfolio = await getPortfolioData((await params).slug);

  // Get parent metadata (from layout)
  const previousImages = (await parent).openGraph?.images || [];
  const previousTitle = (await parent).title || "portfolios";

  // Default metadata if Portfolio not found
  if (!Portfolio) {
    return {
      title: `Portfolio Not Found | ${previousTitle}`,
      description: "The requested Portfolio could not be found.",
    };
  }

  // Build metadata based on Portfolio content
  return {
    title: `${Portfolio.title} | portfolios`,
    description:
      Portfolio.excerpt || `Learn more about my Portfolio: ${Portfolio.title}`,
    keywords: Portfolio.technologies?.join(", ") || "",
    openGraph: {
      title: Portfolio.title,
      description:
        Portfolio.excerpt ||
        `Learn more about my Portfolio: ${Portfolio.title}`,
      type: "website",
      url: Portfolio.liveUrl || undefined,
      images: Portfolio.featuredImage
        ? [
            {
              url: Portfolio.featuredImage,
              width: 1200,
              height: 630,
              alt: Portfolio.title,
            },
            ...previousImages,
          ]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: Portfolio.title,
      description:
        Portfolio.excerpt ||
        `Learn more about my Portfolio: ${Portfolio.title}`,
      images: Portfolio.featuredImage ? [Portfolio.featuredImage] : undefined,
    },
  };
}

// Server Component that renders the Client Component
export default function PortfolioPage() {
  return <ClientPortfolioDetail />;
}
