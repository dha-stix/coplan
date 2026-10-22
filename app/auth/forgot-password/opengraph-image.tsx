import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Reset your Coplan password.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Account help",
    title: "Locked out?",
    highlight: "Get back to your board.",
    subtitle: "Reset your Coplan password in a minute and pick up where you left off.",
  });
}
