# Portfolio & Blog Platform

![Portfolio Platform](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-Latest-FF4154?logo=react-query)
![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)

## 🚀 Overview

A modern, full-featured portfolio and blog platform built with Next.js 14, featuring a clean UI, authentication, and content management capabilities. Perfect for developers, designers, and creators looking to showcase their work professionally.

## ✨ Features

- **Dynamic Portfolio** - Showcase your portfolios with rich media support
- **Blog Platform** - Share your insights with a full-featured blog
- **Admin Dashboard** - Manage content through an intuitive interface
- **Authentication** - Secure user login with Clerk
- **Responsive Design** - Beautiful experience across all devices
- **Dark/Light Mode** - System preference and manual theme switching
- **Contact Form** - Integrated messaging system for visitors

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **State Management**: TanStack Query
- **UI Components**: Custom components with shadcn/ui
- **Fonts**: Geist Sans & Geist Mono
- **Notifications**: Sonner Toast

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-platform.git

# Navigate to the Portfolio
cd portfolio-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

## 🔧 Configuration

Create a `.env.local` file with the following variables:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FORCE_REDIRECT_URL=/home
CLERK_SIGN_UP_FORCE_REDIRECT_URL=/home
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/home
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/home

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Email Service
RESEND_API_KEY=your_resend_api_key

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000/

# AI/ML
GOOGLE_AI_KEY=your_google_ai_key
TAVILY_API_KEY=your_tavily_api_key
NEXT_PUBLIC_LANGSMITH_API_KEY=your_langsmith_api_key (Optional)

# Optional: Analytics, etc.
```

## 📂 Portfolio Structure

```
src/
├── app/                # Next.js App Router
│   ├── (App)/          # Main application routes
│   ├── (Auth)/         # Authentication routes
│   └── api/            # API routes
├── components/         # Reusable UI components
├── lib/                # Utilities, API services, and models
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 📱 Pages & Features

- **Home** - Introduction and featured content
- **portfolios** - Portfolio showcasing your work
- **Blog** - Articles and content publishing
- **About** - Professional details and history
- **Contact** - Get in touch form
- **Admin** - Content management dashboard

## 🔒 Authentication

This Portfolio uses Clerk for authentication, providing:

- Secure sign-in/sign-up flows
- Role-based access control
- Profile management
- Session handling

## 📊 Admin Dashboard

The admin area allows for:

- Managing portfolio portfolios
- Publishing and editing blog posts
- Viewing and responding to contact messages
- User management

## 🎨 Customization

Easily customize the platform to match your personal brand:

- Update theme colors in `tailwind.config.js`
- Modify components in the `components/` directory
- Update content models in `lib/models.ts`

## 📄 License

This Portfolio is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created with ❤️ by OurShop

---

⭐ If you find this Portfolio useful, please consider giving it a star!
