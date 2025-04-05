import { Metadata, ResolvingMetadata } from "next";
import ClientBlogDetail from "./client";

// Function to fetch blog data for metadata
async function getBlogData(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs?slug=${slug}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) return null;
    const blogs = await response.json();
    return blogs[0];
  } catch (error) {
    console.error("Error fetching blog data for metadata:", error);
    return null;
  }
}

// Dynamic metadata generation
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  // Get the blog data
  const blog = await getBlogData(slug);

  // Get parent metadata (from layout)
  const previousImages = (await parent).openGraph?.images || [];
  const previousTitle = (await parent).title || "Blog";

  // Default metadata if blog not found
  if (!blog) {
    return {
      title: `Blog Post Not Found | ${previousTitle}`,
      description: "The requested blog post could not be found.",
    };
  }

  // Format date for metadata if available
  const publishDate = blog.publishedAt
    ? new Date(blog.publishedAt).toISOString()
    : undefined;

  // Build metadata based on blog content
  return {
    title: `${blog.title} | Blog`,
    description: blog.excerpt || `Read our blog post about ${blog.title}`,
    authors: blog.author ? [{ name: blog.author }] : [{ name: "OurShop" }],
    openGraph: {
      title: blog.title,
      description: blog.excerpt || `Read our blog post about ${blog.title}`,
      type: "article",
      publishedTime: publishDate,
      authors: blog.author ? [blog.author] : ["OurShop"],
      images: blog.featuredImage
        ? [
            {
              url: blog.featuredImage,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
            ...previousImages,
          ]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || `Read our blog post about ${blog.title}`,
      images: blog.featuredImage ? [blog.featuredImage] : undefined,
    },
  };
}

// Server Component that renders the Client Component
export default function BlogPage() {
  return <ClientBlogDetail />;
}
