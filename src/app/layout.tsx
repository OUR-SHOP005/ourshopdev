import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/lib/tanstack/provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import MarketingMailConsent from "@/components/MarketingMailConsent";
// import Script from "next/script";

// Optimize font loading with display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const APP_TITLE = {
  default: "OurShop",
  template: "%s | OurShop",
};
const AUTHOR_NAME = "OurShop";
const APP_DESCRIPTION =
  "This website showcases my work and portfolios that delivers high quality content. I also write blogs on my learnings and experiences.";

const APP_URL = "https://utkarshchaudhary.space";

export const metadata: Metadata = {
  applicationName: APP_TITLE.default,
  title: APP_TITLE,
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_TITLE.default,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "application-name": APP_TITLE.default,
    "apple-mobile-web-app-title": APP_TITLE.default,
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    AUTHOR_NAME,
    "Ai",
    "Software Engineer",
    "Web Developer",
    "Blog",
    "portfolios",
  ],
  authors: [{ name: AUTHOR_NAME, url: APP_URL }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_TITLE.default,
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dgdfxsuoh/image/upload/v1743308983/uploads/sm8msfmlsujjnh7yizuv.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang='en'
        suppressHydrationWarning
      >
        <head>
          {/* Critical preload script with highest priority */}
          {/* <Script
            src='/scripts/preload.js'
            strategy='beforeInteractive'
          /> */}

          {/* Preconnect to critical domains */}
          {/* <link
            rel='preconnect'
            href='https://res.cloudinary.com'
            crossOrigin='anonymous'
          />
          <link
            rel='dns-prefetch'
            href='https://res.cloudinary.com'
          /> */}
          {/* <link
            rel='preconnect'
            href='https://fonts.googleapis.com'
          />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />

          {/* Preload critical CSS */}
          {/* <link 
            rel='preload'
            href='/fonts/geist-font.woff2'
            as='font'
            type='font/woff2'
            crossOrigin='anonymous'
          /> */}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <TanstackProvider>
              {/* Prioritize main content rendering */}
              <div>{children}</div>

              {/* Defer non-critical UI elements */}
              <div className='mt-auto'>
                <Toaster position='top-right' />
                <MarketingMailConsent />
              </div>
            </TanstackProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
