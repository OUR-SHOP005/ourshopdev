import { z } from "zod";

// Interfaces
export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  structuredData?: Record<string, unknown>;
}

export interface IOpenGraph {
  title?: string;
  description?: string;
  images?: { url: string }[];
}

export interface IPortfolio {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  excerpt: string;
  featuredImage?: string;
  gallery?: string[];
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  category: string;
  status: "in-progress" | "completed" | "planned";
  aiGenerated: boolean;
  markdown?: boolean;
  featured?: boolean;
  embeddings?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  aiGenerated?: boolean;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    openGraph?: IOpenGraph;
  };
  publishedAt?: string;
  isPublished?: boolean;
}
// Contact Schema
export interface IContact extends Document {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: Date;
  clerkId: string;
}

export interface IJob {
  title: string;
  company: string;
  period: string;
  description?: string;
}

export interface IStory {
  heading: string;
  content: string;
}

export interface ISocialLink {
  name: string;
  url: string;
  platform: string;
  icon?: string;
}

export interface ITeamMember {
  name: string;
  position: string;
  about: string;
  skills: string[];
  profileImage?: string;
  socialLinks?: ISocialLink[];
}

export interface ICompanyInfo {
  company_name: string;
  tagline: string;
  description: string;
  logo?: string;
  location: string;
  email: string;
  stories: IStory[];
  socialLinks: ISocialLink[];
  team: ITeamMember[];
  updatedAt: Date;
}

// Ad Schema
export interface IAd {
  _id?: string;
  title: string;
  image: string;
  cta_url: string;
  target: {
    categories?: string[];
    tags?: string[];
    location?: string;
  };
  impressions: number;
  clicks: number;
  created_at: Date;
}

// Marketing Mail Schema
export interface IMarketingMail {
  _id?: string;
  clerkId: string;
  name: string;
  email: string;
  hasConsented: boolean;
  createdAt: Date;
}

// SEO Schema
export interface ISEO {
  _id?: string;
  pagePath: string;
  title: string;
  description: string;
  keywords?: string[];
  robots?: string;
  openGraph?: IOpenGraph;
  lastModified: Date;
}

// Zod Schemas
export const OpenGraphSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string() })).optional(),
});

export const SEOSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().min(5).max(160).optional(),
  keywords: z.array(z.string()).optional(),
  structuredData: z.record(z.string(), z.unknown()).optional(),
});

export const PortfolioSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  description: z.string().min(30, "Description must be at least 50 characters"),
  excerpt: z.string().max(360, "Excerpt must not exceed 160 characters"),
  featuredImage: z.string().optional(),
  gallery: z
    .array(z.string().url("Gallery images must be valid URLs"))
    .optional(),
  technologies: z.array(z.string()),
  githubUrl: z.string().url("GitHub URL must be valid").optional().nullable(),
  liveUrl: z.string().url("Live URL must be valid").optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  category: z.string().min(2, "Category must be at least 2 characters"),
  status: z.enum(["in-progress", "completed", "planned"]),
  aiGenerated: z.boolean().default(false),
  markdown: z.boolean().default(true),
  featured: z.boolean().default(false),
  embeddings: z.array(z.number()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const PortfolioRequestSchema = PortfolioSchema.omit({
  aiGenerated: true,
  embeddings: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const BlogSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(160).optional(),
  featuredImage: z.string().optional(),
  aiGenerated: z.boolean().default(false),
  featured: z.boolean().default(false),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().min(10).max(160).optional(),
      canonicalUrl: z.string().optional(),
      openGraph: OpenGraphSchema.optional(),
    })
    .optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean().default(false),
});

// Add BlogFormData type
export type BlogFormData = Omit<IBlog, "_id" | "createdAt" | "updatedAt"> & {
  featured: boolean;
  isPublished: boolean;
};

// Add PortfolioFormData type
export type PortfolioFormData = Omit<
  IPortfolio,
  "_id" | "createdAt" | "updatedAt"
>;

// Define the Zod schema for the form
export const jobSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  period: z.string().min(1, { message: "Period is required" }),
  description: z.string().optional(),
});

export const storySchema = z.object({
  heading: z.string().min(1, { message: "Heading is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export const socialLinkSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  url: z.string().url({ message: "Invalid URL" }),
  platform: z.string().min(1, { message: "Platform is required" }),
  icon: z.string().optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  about: z.string().min(1, { message: "About is required" }),
  skills: z.array(z.string()),
  profileImage: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
});

export const companyInfoSchema = z.object({
  company_name: z.string().min(1, { message: "Company name is required" }),
  tagline: z.string().min(1, { message: "Tagline is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  logo: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().min(1, { message: "Location is required" }),
  stories: z.array(storySchema),
  socialLinks: z.array(socialLinkSchema),
  team: z.array(teamMemberSchema),
  updatedAt: z.date().default(() => new Date()),
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: z.enum(["unread", "read", "replied"]).default("unread"),
  createdAt: z.date().default(() => new Date()),
  clerkId: z.string().optional(),
});

// Add Ad Zod Schema
export const AdTargetSchema = z.object({
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
});

export const AdSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  image: z.string().url("Image must be a valid URL"),
  cta_url: z.string().url("CTA URL must be a valid URL"),
  target: AdTargetSchema,
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  created_at: z.date().default(() => new Date()),
});

export const AdRequestSchema = AdSchema.omit({
  _id: true,
  impressions: true,
  clicks: true,
  created_at: true,
}).extend({
  target: AdTargetSchema,
});

// Fix the BlogRequestSchema issue
export const BlogRequestSchema = z.object({
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(160).optional(),
  featuredImage: z.string().optional(),
  featured: z.boolean(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().min(10).max(160).optional(),
      canonicalUrl: z.string().optional(),
      openGraph: OpenGraphSchema.optional(),
    })
    .optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean(),
});

export const MarketingMailSchema = z.object({
  _id: z.string().optional(),
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email("Invalid email address"),
  hasConsented: z.boolean(),
  createdAt: z.date().default(() => new Date()),
});

// Add SEO Zod Schema
export const SEOMetadataSchema = z.object({
  _id: z.string().optional(),
  pagePath: z.string().min(1, "Page path is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(160, "Description must not exceed 160 characters"),
  keywords: z.array(z.string()).optional(),
  robots: z.string().default("index, follow"),
  openGraph: OpenGraphSchema.optional(),
  lastModified: z.date().default(() => new Date()),
});

export const seoFormSchema = z.object({
  pagePath: z.string().min(1, "Page path is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(160, "Description must not exceed 160 characters"),
  keywords: z.string().optional(),
  robots: z.string().default("index, follow"),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
});

export interface SitemapEntry {
  id?: string;
  url: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  lastmod?: string;
}

export interface IService {
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  featured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ServiceSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  image: z.string().url("Image must be a valid URL"),
  featured: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const ServiceRequestSchema = ServiceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

// Add ServiceFormData type
export type ServiceFormData = Omit<IService, "_id" | "createdAt" | "updatedAt">;
