"use client";
import { useCompanyInfo } from "@/lib/api/services/companyService";
import { useFeaturedPortfolios } from "@/lib/api/services/portfolioService";
import { useFeaturedBlogs } from "@/lib/api/services/blogService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { IBlog, IPortfolio, ICompanyInfo } from "@/lib/types";
import { memo, useMemo, Suspense } from "react";

// Memoized components to reduce re-renders
const HeroSection = memo(
  ({
    companyInfo,
    isLoading,
  }: {
    companyInfo: ICompanyInfo;
    isLoading: boolean;
  }) => {
    return (
      <section className='flex flex-col lg:flex-row items-center justify-between gap-8'>
        <div className='flex-1 space-y-6'>
          {isLoading ? (
            <>
              <Skeleton className='h-12 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-4/6' />
              <Skeleton className='h-10 w-40' />
            </>
          ) : (
            <>
              <h1 className='text-4xl md:text-5xl font-bold'>
                {companyInfo?.company_name || "Your Company"}
              </h1>
              <p className='text-xl text-muted-foreground'>
                {companyInfo?.tagline || "Your Company Tagline"}
              </p>
              <p className='text-lg'>
                {companyInfo?.description || "Your company description..."}
              </p>
              <div className='flex flex-wrap gap-3'>
                <Button asChild>
                  <Link
                    href='/services'
                    aria-label='Our Services'
                  >
                    Our Services
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  asChild
                >
                  <Link
                    href='/contact'
                    aria-label='Contact Us'
                  >
                    Contact Us
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
        <div className='flex-1 max-w-md'>
          {isLoading ? (
            <Skeleton className='w-full aspect-square rounded-xl' />
          ) : companyInfo?.logo ? (
            <AspectRatio
              ratio={1}
              className='bg-muted rounded-xl overflow-hidden'
            >
              <Image
                src={companyInfo.logo}
                alt={companyInfo?.company_name || "Company Logo"}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                className='object-contain'
                priority
                fetchPriority='high'
                loading='eager'
                blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg=='
              />
            </AspectRatio>
          ) : (
            <AspectRatio
              ratio={1}
              className='bg-muted rounded-xl flex items-center justify-center'
            >
              <span className='text-muted-foreground'>No logo available</span>
            </AspectRatio>
          )}
        </div>
      </section>
    );
  }
);

// Optimized image component with better loading strategies
const OptimizedImage = memo(
  ({
    src,
    alt,
    aspectRatio = 16 / 9,
    priority = false,
  }: {
    src: string;
    alt: string;
    aspectRatio?: number;
    priority?: boolean;
  }) => {
    // Generate a tiny placeholder for better LCP
    const placeholder =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V9sxCgAAAABJRU5ErkJggg==";

    return (
      <AspectRatio
        ratio={aspectRatio}
        className='bg-muted overflow-hidden'
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          className='object-cover'
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          blurDataURL={placeholder}
          placeholder='blur'
        />
      </AspectRatio>
    );
  }
);

// Memoized Portfolio card to prevent unnecessary re-renders
const PortfolioCard = memo(({ Portfolio }: { Portfolio: IPortfolio }) => {
  return (
    <Card
      key={Portfolio._id}
      className='overflow-hidden flex flex-col'
    >
      <div className='relative'>
        <OptimizedImage
          src={Portfolio.featuredImage || "/placeholder-Portfolio.jpg"}
          alt={Portfolio.title}
        />
        <Badge className='absolute top-2 right-2 bg-primary'>Featured</Badge>
      </div>
      <CardHeader>
        <CardTitle>{Portfolio.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='line-clamp-2'>{Portfolio.description}</p>
      </CardContent>
      <CardFooter className='mt-auto'>
        <Button asChild>
          <Link
            href={`/portfolios/${Portfolio.slug}`}
            aria-label={Portfolio.title}
          >
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Memoized blog card component
const BlogCard = memo(({ blog }: { blog: IBlog }) => {
  return (
    <Card
      key={blog._id || blog.slug}
      className='overflow-hidden flex flex-col'
    >
      <div className='relative'>
        <OptimizedImage
          src={blog.featuredImage || "/placeholder-blog.jpg"}
          alt={blog.title}
        />
        <Badge className='absolute top-2 right-2 bg-primary'>Featured</Badge>
      </div>
      <CardHeader>
        <CardTitle>{blog.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='line-clamp-2'>{blog.excerpt}</p>
        {blog.publishedAt && (
          <p className='text-sm text-muted-foreground mt-2'>
            {new Date(blog.publishedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      <CardFooter className='mt-auto'>
        <Button asChild>
          <Link
            href={`/blog/${blog.slug}`}
            aria-label={blog.title}
          >
            Read More
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

// Ensure names are set for React DevTools
HeroSection.displayName = "HeroSection";
PortfolioCard.displayName = "PortfolioCard";
BlogCard.displayName = "BlogCard";
OptimizedImage.displayName = "OptimizedImage";

// PortfoliosSection component to enable code-splitting
const PortfoliosSection = memo(
  ({
    featuredportfolios,
    isLoading,
  }: {
    featuredportfolios: IPortfolio[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className='h-[320px]'
            >
              <Skeleton className='h-full w-full rounded-lg' />
            </Card>
          ))}
        </div>
      );
    }

    if (featuredportfolios.length === 0) {
      return (
        <Card className='p-6 text-center'>
          <p className='text-muted-foreground'>
            No featured portfolios available
          </p>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredportfolios.map((Portfolio) => (
          <PortfolioCard
            key={Portfolio._id}
            Portfolio={Portfolio}
          />
        ))}
      </div>
    );
  }
);

// BlogsSection component to enable code-splitting
const BlogsSection = memo(
  ({
    featuredBlogs,
    isLoading,
  }: {
    featuredBlogs: IBlog[];
    isLoading: boolean;
  }) => {
    if (isLoading) {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className='h-[320px]'
            >
              <Skeleton className='h-full w-full rounded-lg' />
            </Card>
          ))}
        </div>
      );
    }

    if (featuredBlogs.length === 0) {
      return (
        <Card className='p-6 text-center'>
          <p className='text-muted-foreground'>No featured blogs available</p>
        </Card>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {featuredBlogs.map((blog) => (
          <BlogCard
            key={blog._id || blog.slug}
            blog={blog}
          />
        ))}
      </div>
    );
  }
);

PortfoliosSection.displayName = "PortfoliosSection";
BlogsSection.displayName = "BlogsSection";

function HomePage() {
  // Using TanStack Query for all data fetching - hooks already have caching configured internally
  const { data: companyInfo, isLoading: isLoadingDetails } = useCompanyInfo();

  const { data: featuredportfoliosData, isLoading: isLoadingportfolios } =
    useFeaturedPortfolios();

  const { data: featuredBlogsData, isLoading: isLoadingBlogs } =
    useFeaturedBlogs();

  // Memoize data derivation to avoid recalculations on re-renders
  const featuredportfolios = useMemo(
    () => featuredportfoliosData || [],
    [featuredportfoliosData]
  );

  // Handle both array and object formats for blogs
  const featuredBlogs = useMemo(
    () => (Array.isArray(featuredBlogsData) ? featuredBlogsData : []),
    [featuredBlogsData]
  );

  return (
    <main className='container mx-auto py-12 px-4 space-y-16'>
      {/* Hero Section - Critical Path Rendering */}
      <HeroSection
        companyInfo={companyInfo as ICompanyInfo}
        isLoading={isLoadingDetails}
      />

      {/* Featured portfolios Section */}
      <section className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Featured Projects</h2>
          <Button
            variant='outline'
            asChild
          >
            <Link
              href='/portfolios'
              aria-label='View All Projects'
            >
              View All
            </Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-[320px] w-full rounded-lg'
                />
              ))}
            </div>
          }
        >
          <PortfoliosSection
            featuredportfolios={featuredportfolios}
            isLoading={isLoadingportfolios}
          />
        </Suspense>
      </section>

      {/* Featured Blogs Section */}
      <section className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-3xl font-bold'>Company Blog</h2>
          <Button
            variant='outline'
            asChild
          >
            <Link
              href='/blog'
              aria-label='View All Blog Posts'
            >
              View All
            </Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-[320px] w-full rounded-lg'
                />
              ))}
            </div>
          }
        >
          <BlogsSection
            featuredBlogs={featuredBlogs}
            isLoading={isLoadingBlogs}
          />
        </Suspense>
      </section>
    </main>
  );
}

export default memo(HomePage);
