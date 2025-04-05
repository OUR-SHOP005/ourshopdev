"use client";

import { useBlogs } from "@/lib/api/services/blogService";
import { IBlog } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

export default function BlogClient() {
  // Filter to only show published posts
  const { data, isLoading, error } = useBlogs({ isPublished: true });

  if (isLoading) {
    return (
      <main className='container py-24 space-y-8'>
        <div className='flex flex-col items-center text-center space-y-4'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-6 w-full max-w-2xl' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className='overflow-hidden'
            >
              <CardContent className='p-0'>
                <AspectRatio ratio={16 / 9}>
                  <Skeleton className='h-4/5 w-4/5' />
                </AspectRatio>
                <div className='p-6'>
                  <Skeleton className='h-8 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-full mb-4' />
                </div>
              </CardContent>
              <CardFooter className='p-6 pt-0'>
                <Skeleton className='h-10 w-32' />
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='container py-24 space-y-8'>
        <div className='flex flex-col items-center text-center space-y-4'>
          <h1 className='text-4xl font-bold'>Our Blog</h1>
          <p className='text-xl text-red-500'>
            Error loading blog posts. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  // Handle both array and object with blogs property formats
  const blogItems = Array.isArray(data) ? data : data || [];

  return (
    <main className='container py-24 space-y-8'>
      <div className='flex flex-col items-center text-center space-y-4'>
        <h1 className='text-4xl font-bold'>Our Blog</h1>
        <p className='text-xl text-muted-foreground max-w-2xl'>
          Latest insights, tutorials, and updates from our team
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {blogItems.map((blog: IBlog) => (
          <Card
            key={blog.slug}
            className='overflow-hidden'
          >
            <CardContent className='p-0'>
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={blog.featuredImage || "/fallback-blog-image.jpg"}
                  alt={blog.title}
                  fill
                  className='object-cover transition-all hover:scale-105'
                  priority
                />
              </AspectRatio>
              <div className='p-6'>
                <h2 className='text-2xl font-semibold mb-2'>{blog.title}</h2>
                <p className='text-muted-foreground mb-4'>{blog.excerpt}</p>
                <div className='text-sm text-muted-foreground'>
                  {blog.publishedAt && (
                    <time dateTime={new Date(blog.publishedAt).toISOString()}>
                      {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className='p-6 pt-0'>
              <Button asChild>
                <Link href={`/blog/${blog.slug}`} aria-label={blog.title}>
                  Read More
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
} 