import { Metadata } from "next";
import PortfoliosClient from "./client";
import { generateMetadata as getSEOMetadata } from "@/lib/seoUtils";

// Define fallback metadata
const fallbackMetadata: Metadata = {
  title: "portfolios | OurShop",
  description:
    "A collection of portfolios I've worked on, from web applications to AI experiments.",
  openGraph: {
    title: "portfolios | OurShop",
    description:
      "A collection of portfolios I've worked on, from web applications to AI experiments.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "portfolios by OurShop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "portfolios | OurShop",
    description:
      "A collection of portfolios I've worked on, from web applications to AI experiments.",
    images: [
      "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
    ],
  },
};

// Generate metadata using our utility function
export async function generateMetadata(): Promise<Metadata> {
  return getSEOMetadata("/portfolios", fallbackMetadata);
}

export default function PortfoliosPage() {
  return <PortfoliosClient />;
}
