"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { IPortfolio } from "@/lib/types";
import { usePortfolios } from "@/lib/api/services/portfolioService";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfoliosClient() {
  // Use TanStack Query to fetch portfolios
  const { data, isLoading, error } = usePortfolios();

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
                  <Skeleton className='h-full w-full' />
                </AspectRatio>
                <div className='p-6'>
                  <Skeleton className='h-8 w-3/4 mb-2' />
                  <Skeleton className='h-4 w-full mb-4' />
                  <div className='flex flex-wrap gap-2'>
                    <Skeleton className='h-6 w-16' />
                    <Skeleton className='h-6 w-20' />
                    <Skeleton className='h-6 w-24' />
                  </div>
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

  if (error as Error) {
    return (
      <main className='container py-24 space-y-8'>
        <div className='flex flex-col items-center text-center space-y-4'>
          <h1 className='text-4xl font-bold'>My portfolios</h1>
          <p className='text-xl text-red-500'>
            Error loading portfolios. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const portfolios = data || [];

  return (
    <main className='container py-24 space-y-8'>
      <div className='flex flex-col items-center text-center space-y-4'>
        <h1 className='text-4xl font-bold'>My portfolios</h1>
        <p className='text-xl text-muted-foreground max-w-2xl'>
          A collection of portfolios I{"'"}ve worked on, from web applications
          to AI experiments
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {portfolios.map((Portfolio: IPortfolio) => (
          <Card
            key={Portfolio.slug}
            className='overflow-hidden'
          >
            <CardContent className='p-0'>
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={Portfolio.featuredImage || "/vercel.svg"}
                  alt={Portfolio.title}
                  fill
                  className='object-cover transition-all hover:scale-105'
                />
              </AspectRatio>
              <div className='p-6'>
                <h2 className='text-2xl font-semibold mb-2'>
                  {Portfolio.title}
                </h2>
                <p className='text-muted-foreground mb-4'>
                  {Portfolio.excerpt}
                </p>
                <div className='flex flex-wrap gap-2'>
                  {Portfolio.technologies?.map((tech: string) => (
                    <Badge
                      key={tech}
                      variant='secondary'
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className='p-6 pt-0'>
              <Button asChild>
                <Link
                  href={`/portfolios/${Portfolio.slug}`}
                  aria-label={Portfolio.title}
                >
                  View Portfolio
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
