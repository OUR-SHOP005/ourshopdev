import { Metadata } from "next";
import AboutClient from "./client";
import { generateMetadata as getSEOMetadata } from "@/lib/seoUtils";

// Define fallback metadata
const fallbackMetadata: Metadata = {
  title: "About Me | OurShop",
  description:
    "Learn more about OurShop, my background, work experience, and personal stories.",
  openGraph: {
    title: "About Me | OurShop",
    description:
      "Learn more about OurShop, my background, work experience, and personal stories.",
    type: "profile",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
        alt: "OurShop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Me | OurShop",
    description:
      "Learn more about OurShop, my background, work experience, and personal stories.",
    images: [
      "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
    ],
  },
};

// Generate metadata using our utility function
export async function generateMetadata(): Promise<Metadata> {
  return getSEOMetadata("/about", fallbackMetadata);
}

export default function AboutPage() {
  return <AboutClient />;
}
