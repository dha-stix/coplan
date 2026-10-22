import type { Metadata } from "next";

/** Public address used for absolute links in share previews. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const SITE_NAME = "Coplan";
export const SITE_DESCRIPTION = "Shared boards, drag-and-drop tasks, comments and @mentions — so your team always knows what's next.";

/**
 * Title + description for a page, repeated in the Open Graph and X/Twitter tags.
 * Next replaces (rather than merges) a parent's `openGraph`, so the shared fields are set here too.
 */
export function shareMetadata(title: string, description: string): Metadata {
  const shareTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: shareTitle, description },
    twitter: { card: "summary_large_image", title: shareTitle, description },
  };
}
