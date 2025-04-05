// This script helps with resource prioritization
// It preloads critical assets and manages resource hints

// Function to dynamically add resource hints
function addResourceHint(type, url, as = null, crossOrigin = null) {
  const link = document.createElement("link");
  link.rel = type;
  link.href = url;

  if (as) link.setAttribute("as", as);
  if (crossOrigin) link.setAttribute("crossorigin", crossOrigin);

  document.head.appendChild(link);
}

// Detect connection speed to adjust loading strategy
function detectConnectionSpeed() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (connection) {
    if (connection.effectiveType === "4g" && !connection.saveData) {
      return "fast";
    } else {
      return "slow";
    }
  }

  return "unknown";
}

// Prioritize visible content first
function preloadCriticalAssets() {
  const connectionSpeed = detectConnectionSpeed();

  // Critical paths that should always be preloaded
  const criticalAssets = [
    {
      type: "preload",
      url: "/fonts/geist-font.woff2",
      as: "font",
      crossOrigin: "anonymous",
    },
    { type: "dns-prefetch", url: "https://res.cloudinary.com" },
    {
      type: "preconnect",
      url: "https://res.cloudinary.com",
      crossOrigin: "anonymous",
    },
  ];

  // Add additional preloads for fast connections
  const fastConnectionAssets = [
    // Add assets here that should only be preloaded on fast connections
  ];

  // Process critical assets first
  criticalAssets.forEach((asset) => {
    addResourceHint(asset.type, asset.url, asset.as, asset.crossOrigin);
  });

  // Only load additional preloads on fast connections
  if (connectionSpeed === "fast") {
    fastConnectionAssets.forEach((asset) => {
      addResourceHint(asset.type, asset.url, asset.as, asset.crossOrigin);
    });
  }
}

// Execute preloading
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", preloadCriticalAssets);
} else {
  preloadCriticalAssets();
}
