import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bandlik Portal — Qiziltepa tumani",
    short_name: "Bandlik Portal",
    description: "Qiziltepa tumanidagi ochiq ish oʻrinlari",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#a02d22",
    lang: "uz",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
