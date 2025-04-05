"use client";

import React from "react";
import SocialShare from "@/components/ui/social-share";
import { Card } from "@/components/ui/card";
import { ShareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogShareProps {
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  hashtags?: string[];
  className?: string;
  position?: "top" | "bottom" | "floating";
}

export default function BlogShare({
  title,
  url,
  description = "",
  imageUrl = "",
  hashtags = [],
  className,
  position = "bottom",
}: BlogShareProps) {
  // Ensure absolute URL
  const shareUrl = url.startsWith("http") ? url : `https://${window.location.host}${url}`;

  if (position === "floating") {
    return (
      <div className={cn("blog-share-floating", className)}>
        <SocialShare
          url={shareUrl}
          title={title}
          description={description}
          media={imageUrl}
          hashtags={hashtags}
          variant="floating"
          buttonSize={40}
          showShareCount={false}
          platforms={["facebook", "twitter", "linkedin", "whatsapp", "telegram"]}
        />
      </div>
    );
  }

  return (
    <Card className={cn("blog-share p-4 my-6", className)}>
      <div className="flex items-center gap-4 mb-3">
        <ShareIcon className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Share this article</h3>
      </div>
      
      <SocialShare
        url={shareUrl}
        title={title}
        description={description}
        media={imageUrl}
        hashtags={hashtags}
        buttonSize={36}
        className="justify-center sm:justify-start"
        platforms={["facebook", "twitter", "linkedin", "reddit", "whatsapp", "email"]}
      />
    </Card>
  );
}

// Example usage in a blog post component:
// 
// export default function BlogPost({ post }) {
//   return (
//     <article>
//       <h1>{post.title}</h1>
//       <BlogShare 
//         title={post.title}
//         url={`/blog/${post.slug}`}
//         description={post.excerpt}
//         imageUrl={post.coverImage}
//         hashtags={post.tags}
//         position="floating"
//       />
//       <div className="content">{post.content}</div>
//       <BlogShare 
//         title={post.title}
//         url={`/blog/${post.slug}`}
//         description={post.excerpt}
//         imageUrl={post.coverImage}
//         hashtags={post.tags}
//       />
//     </article>
//   );
// } 