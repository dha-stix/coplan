import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Share-preview image (Open Graph + X/Twitter) used by every opengraph-image.tsx route.
 * 1200×630 is the size Facebook, LinkedIn, X, WhatsApp, Slack, Discord and iMessage all expect.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export interface OgContent {
  eyebrow: string;
  title: string;
  /** Second headline line, shown in brand indigo. */
  highlight: string;
  subtitle: string;
}

const C = {
  ink: "#0E1020",
  muted: "#555B70",
  line: "#E3E5EE",
  canvas: "#F6F7FB",
  brand: "#4338CA",
  brandSoft: "#EEF0FF",
  lime: "#D4F75B",
};

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", width: 52, height: 52, borderRadius: 14, background: C.brand, padding: 13, gap: 6 }}>
        <div style={{ width: 10, height: 26, borderRadius: 3, background: "#fff" }} />
        <div style={{ width: 10, height: 16, borderRadius: 3, background: C.lime }} />
      </div>
      <div style={{ fontFamily: "Bricolage", fontSize: 36, color: C.ink, letterSpacing: -1 }}>Coplan</div>
    </div>
  );
}

const CARDS: { tag: string; bg: string; fg: string; title: string; who: string; color: string }[][] = [
  [
    { tag: "Research", bg: "#E0F2FE", fg: "#075985", title: "Competitor audit", who: "SR", color: "#BE185D" },
    { tag: "Copy", bg: "#F3E8FF", fg: "#6B21A8", title: "Homepage headlines", who: "DA", color: "#F97316" },
  ],
  [{ tag: "Dev", bg: "#DCFCE7", fg: "#166534", title: "Auth with Google", who: "JL", color: "#4338CA" }],
  [
    { tag: "Design", bg: "#FFEDD5", fg: "#9A3412", title: "Moodboard", who: "MK", color: "#0F766E" },
    { tag: "Dev", bg: "#DCFCE7", fg: "#166534", title: "Repo setup", who: "JL", color: "#4338CA" },
  ],
];
const COLUMNS = ["To do", "In progress", "Done"];

/** Illustrative board, matching the homepage hero. */
function BoardPreview() {
  return (
    <div style={{ display: "flex", position: "relative", width: 500, height: 430 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 500,
          background: "#fff",
          border: `1px solid ${C.line}`,
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 30px 70px rgba(14,16,32,0.14)",
          transform: "rotate(-2deg)",
          marginTop: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: C.brand }} />
          <div style={{ fontFamily: "InterSemi", fontSize: 18, color: C.ink }}>Website relaunch</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {COLUMNS.map((name, i) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", flex: 1, gap: 8, background: C.canvas, borderRadius: 14, padding: 10 }}>
              <div style={{ fontFamily: "InterSemi", fontSize: 13, color: C.muted }}>{name}</div>
              {CARDS[i].map((card) => (
                <div key={card.title} style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10 }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ fontFamily: "InterSemi", fontSize: 11, background: card.bg, color: card.fg, borderRadius: 5, padding: "2px 7px" }}>{card.tag}</div>
                  </div>
                  <div style={{ fontFamily: "Inter", fontSize: 14, color: C.ink, lineHeight: 1.3 }}>{card.title}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: card.color,
                        color: "#fff",
                        fontFamily: "InterSemi",
                        fontSize: 9,
                      }}
                    >
                      {card.who}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* @mention notification */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: -10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          width: 300,
          background: C.ink,
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 20px 40px rgba(14,16,32,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 17, background: C.brand, color: C.lime, fontFamily: "InterSemi", fontSize: 18 }}>
          @
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", fontSize: 14, color: "#fff", lineHeight: 1.35 }}>
          <div style={{ display: "flex", fontFamily: "InterSemi" }}>Maya mentioned you</div>
          <div style={{ display: "flex", color: "#B9BCCB" }}>&ldquo;Can you review the copy?&rdquo;</div>
        </div>
      </div>
    </div>
  );
}

export async function renderOgImage({ eyebrow, title, highlight, subtitle }: OgContent) {
  const [bricolage, inter, interSemi] = await Promise.all([
    font("bricolage-grotesque-latin-700-normal.woff"),
    font("inter-latin-500-normal.woff"),
    font("inter-latin-600-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: C.canvas, padding: "56px 64px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <Logo />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex" }}>
              <div style={{ fontFamily: "InterSemi", fontSize: 20, color: C.ink, background: C.lime, borderRadius: 999, padding: "6px 16px" }}>{eyebrow}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bricolage", fontSize: 68, lineHeight: 1.04, letterSpacing: -2.5 }}>
              <div style={{ display: "flex", color: C.ink }}>{title}</div>
              <div style={{ display: "flex", color: C.brand }}>{highlight}</div>
            </div>
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.45, color: C.muted }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", fontFamily: "InterSemi", fontSize: 20, color: C.muted }}>Boards · Comments · @mentions · Email invites</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <BoardPreview />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Bricolage", data: bricolage, weight: 700, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
        { name: "InterSemi", data: interSemi, weight: 600, style: "normal" },
      ],
    },
  );
}
