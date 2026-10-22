import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Create your Coplan account — bring your team onto one board.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "100% free",
    title: "Bring your team",
    highlight: "onto one board.",
    subtitle: "Create a workspace in seconds and invite teammates by email.",
  });
}
