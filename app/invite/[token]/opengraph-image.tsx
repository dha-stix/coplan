import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "You're invited to join your team on Coplan.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Invite details are private, so every invite link shares the same general preview.
export default function Image() {
  return renderOgImage({
    eyebrow: "You're invited",
    title: "Join your team",
    highlight: "on Coplan.",
    subtitle: "Accept the invite to see the board, tasks and conversations.",
  });
}
