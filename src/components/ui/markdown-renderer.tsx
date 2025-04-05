"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import "./markdown.css";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div
      className={cn(
        "markdown-content prose prose-stone dark:prose-invert max-w-none",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeSanitize,
          rehypeSlug,
          rehypeKatex,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={{
          h1: ({ className, ...props }) => (
            <h1
              className={cn(
                "text-3xl font-bold tracking-tight mt-8 mb-4",
                className
              )}
              {...props}
            />
          ),
          h2: ({ className, ...props }) => (
            <h2
              className={cn(
                "text-2xl font-bold tracking-tight mt-8 mb-4",
                className
              )}
              {...props}
            />
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "text-xl font-bold tracking-tight mt-6 mb-3",
                className
              )}
              {...props}
            />
          ),
          h4: ({ className, ...props }) => (
            <h4
              className={cn(
                "text-lg font-bold tracking-tight mt-4 mb-2",
                className
              )}
              {...props}
            />
          ),
          p: ({ className, ...props }) => (
            <p
              className={cn("leading-7 mb-4", className)}
              {...props}
            />
          ),
          a: ({ className, ...props }) => (
            <a
              className={cn(
                "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
                className
              )}
              {...props}
              target='_blank'
              rel='noopener noreferrer'
            />
          ),
          ul: ({ className, ...props }) => (
            <ul
              className={cn("list-disc pl-6 mb-4", className)}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn("list-decimal pl-6 mb-4", className)}
              {...props}
            />
          ),
          li: ({ className, ...props }) => (
            <li
              className={cn("mb-1", className)}
              {...props}
            />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn(
                "border-l-4 border-primary/20 pl-4 italic my-4",
                className
              )}
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            return (
              <CodeBlock
                className={className}
                language={match ? match[1] : ""}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            );
          },
          pre: ({ className, ...props }) => (
            <pre
              className={cn(
                "mb-4 mt-4 overflow-x-auto rounded-lg border bg-black p-4 dark:bg-black/90",
                className
              )}
              {...props}
            />
          ),
          img: ({ className, alt, ...props }) => (
            <img
              className={cn(
                "rounded-md border my-6 mx-auto max-h-96",
                className
              )}
              alt={alt}
              {...props}
            />
          ),
          table: ({ className, ...props }) => (
            <div className='my-6 w-full overflow-y-auto'>
              <table
                className={cn("w-full border-collapse text-sm", className)}
                {...props}
              />
            </div>
          ),
          th: ({ className, ...props }) => (
            <th
              className={cn(
                "border bg-muted px-4 py-2 text-left font-medium [&[align=center]]:text-center [&[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
          td: ({ className, ...props }) => (
            <td
              className={cn(
                "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
                className
              )}
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr
              className='my-6 border-muted'
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  children: string;
  className?: string;
  language: string;
}

const CodeBlock = ({ children, className, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='relative group'>
      <div className='code-block-header'>
        {language && <span className='text-xs'>{language}</span>}
        <button
          type='button'
          onClick={handleCopy}
          className='inline-flex items-center gap-1 text-xs transition-colors hover:text-foreground'
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon className='h-3.5 w-3.5' />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className='h-3.5 w-3.5' />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className='mt-0 rounded-t-none'>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

export default MarkdownRenderer;
