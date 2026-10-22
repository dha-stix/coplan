import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Coplan — Plan together. Ship faster. Shared task boards for teams.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Task boards for teams",
    title: "Plan together.",
    highlight: "Ship faster.",
    subtitle: "Shared boards, drag-and-drop tasks and @mentions — so your team always knows what's next.",
  });
}
