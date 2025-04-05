import { Metadata } from "next";
import BlogClient from "./client";
import { generateMetadata as getSEOMetadata } from "@/lib/seoUtils";

// Define fallback metadata
const fallbackMetadata: Metadata = {
  title: "Blog | OurShop",
  description:
    "Latest insights, tutorials, and updates from our team on technology and development.",
  openGraph: {
    title: "Blog | OurShop",
    description:
      "Latest insights, tutorials, and updates from our team on technology and development.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "Blog by OurShop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | OurShop",
    description:
      "Latest insights, tutorials, and updates from our team on technology and development.",
    images: [
      "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
    ],
  },
};

// Generate metadata using our utility function
export async function generateMetadata(): Promise<Metadata> {
  return getSEOMetadata("/blog", fallbackMetadata);
}

export default function BlogPage() {
  return <BlogClient />;
}
