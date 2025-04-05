import Link from "next/link";
import { IBlog } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export function BlogCard({ blog }: { blog: IBlog }) {
  return (
    <Card className='overflow-hidden'>
      {blog.featuredImage && (
        <div className='relative h-48 w-full'>
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className='object-cover'
          />
        </div>
      )}
      <CardHeader>
        <Link
          href={`/blog/${blog.slug}`}
          aria-label={blog.title}
        >
          <h2 className='text-2xl font-bold hover:text-primary'>
            {blog.title}
          </h2>
        </Link>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>{blog.excerpt}</p>
      </CardContent>
      <CardFooter>
        {blog.publishedAt && (
          <p className='text-sm text-muted-foreground'>
            Published on {formatDate(blog.publishedAt)}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
