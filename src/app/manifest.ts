import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "com.utkarsh-chaudhary.pwa",
    name: "OurShop",
    short_name: "Utkarsh",
    description: "OurShop's personal website",
    start_url: "/",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    dir: "ltr",
    lang: "en",
    categories: ["education", "productivity"],
    prefer_related_applications: false,
  };
}
