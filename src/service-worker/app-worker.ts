import { defaultCache } from "@serwist/next/worker";
import type {
  PrecacheEntry,
  RuntimeCaching,
  SerwistGlobalConfig,
} from "serwist";
import { Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

// Define custom cache configurations
const customRuntimeCaching = [
  ...defaultCache,
  // Cache SEO API responses for 1 hour
  {
    urlPattern: /\/api\/seo(\/.*)?$/,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "seo-api-cache",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 60 * 60, // 1 hour
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  // Exclude error pages from caching
  {
    urlPattern: /\/_error|\/404|\/500$/,
    handler: "NetworkOnly",
  },
  // Cache page content more aggressively
  {
    urlPattern: /\/(blog|portfolios|about|contact)(\/.*)?$/,
    handler: "NetworkFirst",
    options: {
      cacheName: "page-cache",
      networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
    },
  },
  {
    urlPattern: /^https:\/\/res\.cloudinary\.com\/.*$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "image-cache",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
    },
  },
  {
    urlPattern: /\.(?:js|css)$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "static-resources",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "images",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/css/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "google-fonts-stylesheets",
      expiration: {
        maxEntries: 5,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customRuntimeCaching as RuntimeCaching[],
});
serwist.addEventListeners();

// Add background sync for contact form submission if available
if ("sync" in self.registration) {
  self.addEventListener("sync", (event) => {
    if (event.tag === "contact-form-submission") {
      event.waitUntil(syncContactForm());
    }
  });
}

// Function to handle background sync of contact form submissions
async function syncContactForm() {
  try {
    const cache = await caches.open("contact-form-queue");
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await fetch(request.clone());

      if (response.ok) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}
