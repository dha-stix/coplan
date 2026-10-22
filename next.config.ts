import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All app data comes from Firebase on the client, so Cache Components adds nothing here.
  cacheComponents: false,
  images: {
    // Google account profile photos.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
  // Share-preview images read these fonts from disk; make sure they ship with server routes.
  outputFileTracingIncludes: {
    "/**/*": ["./assets/fonts/*.woff"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // Google sign-in uses a popup, which needs this rather than plain "same-origin".
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
