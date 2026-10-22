import type { NextConfig } from "next";

// On Firebase App Hosting the web app config arrives at build time as FIREBASE_WEBAPP_CONFIG.
// Expose it under the NEXT_PUBLIC_FIREBASE_* names lib/firebase.ts reads (values in .env.local win).
const webApp = process.env.FIREBASE_WEBAPP_CONFIG ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG) : null;
const firebaseEnv: Record<string, string> = webApp
  ? {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || webApp.apiKey,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || webApp.authDomain,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || webApp.projectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || webApp.storageBucket,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || webApp.messagingSenderId,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || webApp.appId,
    }
  : {};

const nextConfig: NextConfig = {
  env: firebaseEnv,
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
