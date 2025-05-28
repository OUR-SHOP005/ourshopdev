import mongoose from "mongoose";
import {
  IPortfolio,
  IBlog,
  IContact,
  ICompanyInfo,
  IAd,
  IMarketingMail,
  ISEO,
  IService,
  IBillingRecord,
  IClient,
  IReminderLog,
} from "./types";

const DEFAULT_IMG =
  "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1742598419/uploads/d9eqgzesei4wsgbb6mko.png";

// Add interface for model instance types

const CompanyInfoSchema = new mongoose.Schema<ICompanyInfo>({
  company_name: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: String },
  email: { type: String, required: true },
  location: { type: String, required: true },
  stories: [
    {
      heading: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  socialLinks: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      platform: { type: String, required: true },
      icon: { type: String },
    },
  ],
  team: [
    {
      name: { type: String, required: true },
      position: { type: String, required: true },
      about: { type: String, required: true },
      skills: [{ type: String }],
      profileImage: { type: String },
      socialLinks: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          platform: { type: String, required: true },
          icon: { type: String },
        },
      ],
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

// Portfolio Schema
const PortfolioSchema = new mongoose.Schema<IPortfolio>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  description: { type: String, required: true },
  excerpt: { type: String, maxlength: 160, required: true },
  featuredImage: { type: String, default: DEFAULT_IMG },
  gallery: [{ type: String, default: DEFAULT_IMG }],
  technologies: [{ type: String, required: true }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  category: { type: String, required: true },
  status: {
    type: String,
    enum: ["in-progress", "completed", "planned"],
    required: true,
  },
  featured: { type: Boolean, default: false },
  aiGenerated: { type: Boolean, default: false },
  markdown: { type: Boolean, default: true },
  embeddings: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// request body example

// Add enhanced utility methods to PortfolioSchema
PortfolioSchema.methods.generateStructuredData = function () {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: this.title,
    description: this.description,
    image: this.featuredImage,
    dateCreated: this.startDate || this.createdAt,
    dateModified: this.updatedAt,
    programmingLanguage: this.technologies,
    codeRepository: this.githubUrl,
    url: this.liveUrl,
    category: this.category,
    status: this.status,
  };
};

const AdSchema = new mongoose.Schema<IAd>({
  title: {
    type: String,
    required: [true, "Title is required"],
    minlength: [3, "Title must be at least 3 characters"],
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
  },
  cta_url: {
    type: String,
    required: [true, "CTA URL is required"],
  },
  target: {
    categories: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: null,
    },
  },
  impressions: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const ContactSchema = new mongoose.Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["unread", "read", "replied"],
    default: "unread",
  },
  createdAt: { type: Date, default: Date.now },
});

// Blog Schema
const BlogSchema = new mongoose.Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 160 },
  featuredImage: { type: String, default: DEFAULT_IMG },
  aiGenerated: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalUrl: { type: String },
    openGraph: {
      title: { type: String },
      description: { type: String },
      images: [
        {
          url: { type: String },
        },
      ],
    },
  },
  publishedAt: { type: String },
  isPublished: { type: Boolean, default: false },
});

// SEO Metadata Schema
const SEOSchema = new mongoose.Schema<ISEO>({
  pagePath: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [{ type: String }],
  robots: { type: String, default: "index, follow" },
  openGraph: {
    title: { type: String },
    description: { type: String },
    images: [
      {
        url: { type: String },
      },
    ],
  },
  lastModified: { type: Date, default: Date.now },
});

// Sitemap Schema
const SitemapSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  changefreq: {
    type: String,
    enum: ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"],
    default: "weekly",
  },
  priority: { type: Number, min: 0, max: 1, default: 0.8 },
  lastmod: { type: Date, default: Date.now },
});

// Add indexes for performance
PortfolioSchema.index({ slug: 1, createdAt: -1 });
BlogSchema.index({ publishedAt: -1, isPublished: 1 });

// Add slug generation middleware
PortfolioSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

BlogSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Enable strict schema validation
PortfolioSchema.set("validateBeforeSave", true);
BlogSchema.set("validateBeforeSave", true);

// Add validation middleware for SEO metadata
const validateMetaDescription = (text: string) => {
  return text && text.length >= 10 && text.length <= 160;
};

// PortfolioSchema validation middleware (no SEO validation)
PortfolioSchema.pre("validate", function (next) {
  next();
});

// BlogSchema validation middleware
BlogSchema.pre("validate", function (next) {
  if (
    this.seo?.metaDescription &&
    !validateMetaDescription(this.seo.metaDescription)
  ) {
    this.invalidate(
      "seo.metaDescription",
      "Meta description must be between 120-160 characters"
    );
  }
  next();
});

// MarketingMail Schema
const MarketingMailSchema = new mongoose.Schema<IMarketingMail>({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  hasConsented: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Service Schema
const ServiceSchema = new mongoose.Schema<IService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: DEFAULT_IMG },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for services
ServiceSchema.index({ name: 1 });
ServiceSchema.index({ featured: 1 });

// Client Schema
const ClientSchema = new mongoose.Schema<IClient>({
  // Basic Identity
  name: { type: String, required: true, trim: true, index: true },
  companyName: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  // Point of Contact
  pointOfContact: {
    name: String,
    role: String,
    phone: String,
    email: String,
  },
  // Website Metadata
  website: {
    url: { type: String, trim: true },
    stack: [String],
    domainProvider: String,
    hostingProvider: String,
    domainExpiry: Date,
    mailAddress: String,
    mailExpiry: Date,
    status: { 
      type: String, 
      enum: ['live', 'maintenance', 'offline', 'development'], 
      default: 'development' 
    },
    lastUpdated: Date,
  },
  // Services Offered
  services: [{
    type: String,
    enum: ['design', 'development', 'SEO', 'maintenance', 'hosting', 'domain', 'analytics', 'ecommerce', 'consultation'],
    index: true
  }],
  // Social Profiles
  social: [{
    platform: String,
    url: String
  }],
  // Billing Setup
  billingPlan: {
    model: { 
      type: String, 
      enum: ['monthly', 'one-time', 'retainer'] 
    },
    amount: Number,
    currency: { type: String, default: 'INR' },
    nextDue: Date,
  },
  // Billing History
  billingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillingRecord'
  }],
  // Lifecycle Status
  status: {
    type: String,
    enum: ['lead', 'onboarding', 'active', 'paused', 'inactive'],
    default: 'lead',
    index: true
  },
  // Internal Notes
  notes: { type: String, maxlength: 5000 },
  // Tags
  tags: [String],
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Billing Record Schema
const BillingRecordSchema = new mongoose.Schema<IBillingRecord>({
  clientId: { 
    type: String,
    required: true, 
    index: true,
    ref: 'Client'
  },
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  servicesBilled: [{
    service: {
      type: String,
      enum: ['design', 'development', 'SEO', 'maintenance', 'hosting', 'domain', 'analytics', 'ecommerce', 'other'],
    },
    description: String,
    cost: Number
  }],
  billDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'overdue', 'cancelled'],
    default: 'unpaid',
    index: true
  },
  paymentMethod: { type: String },
  transactionId: { type: String },
  notes: { type: String, maxlength: 2000 },
  billPdfUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add indexes
ClientSchema.index({ email: 1 });
ClientSchema.index({ companyName: 1 });
ClientSchema.index({ 'website.url': 1 });
BillingRecordSchema.index({ clientId: 1, billDate: -1 });


const ReminderLogSchema = new mongoose.Schema<IReminderLog>(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reminderType: {
      type: String,
      enum: ['DOMAIN_EXPIRY'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED'],
      required: true,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


// Export models
export const Portfolio =
  mongoose.models.Portfolio ||
  mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

export const Blog =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export const SEO =
  mongoose.models.SEO || mongoose.model<ISEO>("SEO", SEOSchema);
export const Sitemap =
  mongoose.models.Sitemap || mongoose.model("Sitemap", SitemapSchema);

export const CompanyInfo =
  mongoose.models.CompanyInfo ||
  mongoose.model<ICompanyInfo>("CompanyInfo", CompanyInfoSchema);

export const Contact =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

// Create or use existing model
export const AdModel = mongoose.models.Ad || mongoose.model("Ad", AdSchema);

export const MarketingMail =
  mongoose.models.MarketingMail ||
  mongoose.model<IMarketingMail>("MarketingMail", MarketingMailSchema);

export const Service =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export const Client =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export const BillingRecord =
  mongoose.models.BillingRecord || mongoose.model<IBillingRecord>("BillingRecord", BillingRecordSchema);

  // Check if model is already defined to prevent overwriting during hot reloads
export const ReminderLog: mongoose.Model<IReminderLog> = 
    mongoose.models.ReminderLog || 
    mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema);
