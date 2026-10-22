import { ImageResponse } from "next/og";

/** The Coplan logo mark as a PNG, used for the favicon and the Apple touch icon. */
export function renderBrandIcon(size: number) {
  const pad = Math.round(size * 0.25);
  const bar = Math.round(size * 0.19);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#4338CA", borderRadius: Math.round(size * 0.28), padding: pad, gap: Math.round(size * 0.125) }}>
        <div style={{ width: bar, height: size - pad * 2, borderRadius: Math.round(size * 0.06), background: "#fff" }} />
        <div style={{ width: bar, height: Math.round((size - pad * 2) * 0.62), borderRadius: Math.round(size * 0.06), background: "#D4F75B" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
