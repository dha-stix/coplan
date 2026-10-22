import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Log in to Coplan — pick up where your team left off.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Welcome back",
    title: "Pick up where",
    highlight: "your team left off.",
    subtitle: "Log in with Google or email to see your boards, tasks and mentions.",
  });
}
