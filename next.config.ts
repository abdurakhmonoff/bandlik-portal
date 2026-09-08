import type { NextConfig } from "next";

/**
 * Locale routing without middleware:
 *   /            → app/[locale] with locale=uz
 *   /vakansiyalar → /uz/vakansiyalar (internal rewrite, URL stays clean)
 *   /ru/…        → app/[locale] with locale=ru
 *   /uz/…        → redirected to /… so there is one canonical URL per page
 */
const RESERVED =
  "ru|uz|admin|_next|api|brand|images|favicon\\.ico|icon\\.svg|icon\\.png|apple-icon\\.png|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|opengraph-image";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      { source: "/uz", destination: "/", permanent: true },
      { source: "/uz/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/uz" },
        {
          source: `/:path((?!(?:${RESERVED})(?:/|$)).*)`,
          destination: "/uz/:path",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
