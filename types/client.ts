export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface PointOfContact {
  name?: string
  role?: string
  phone?: string
  email?: string
}

export interface Website {
  url?: string
  stack?: string[]
  domainProvider?: string
  hostingProvider?: string
  domainExpiry?: Date
  mailAddress?: string
  mailExpiry?: Date
  status?: "live" | "maintenance" | "offline" | "development"
  lastUpdated?: Date
}

export interface SocialProfile {
  platform: string
  url: string
}

export interface BillingPlan {
  model?: "monthly" | "one-time" | "retainer"
  amount?: number
  currency?: string
  nextDue?: Date
}

export interface Client {
  _id?: string
  name: string
  companyName?: string
  email: string
  phone?: string
  address?: Address
  pointOfContact?: PointOfContact
  website?: Website
  services?: (
    | "design"
    | "development"
    | "SEO"
    | "maintenance"
    | "hosting"
    | "domain"
    | "analytics"
    | "ecommerce"
    | "consultation"
  )[]
  social?: SocialProfile[]
  billingPlan?: BillingPlan
  status?: "lead" | "onboarding" | "active" | "paused" | "inactive"
  notes?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}
