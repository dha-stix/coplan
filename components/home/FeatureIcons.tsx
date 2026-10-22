/* Small animated SVG icons used across the homepage feature and step cards. */

const base = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "#4338CA", strokeWidth: 1.8, "aria-hidden": true } as const;

export function TypingIcon() {
  return (
    <svg {...base}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z" />
      {[8.5, 12.5, 16.5].map((cx, i) => (
        <circle key={cx} className="cp-typing" cx={cx} cy="12" r="1.2" fill="#4338CA" stroke="none" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </svg>
  );
}

export function RingingBellIcon() {
  return (
    <svg {...base} strokeLinecap="round">
      <g className="cp-ring">
        <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9" />
        <path d="M10.3 20.5a1.9 1.9 0 0 0 3.4 0" />
      </g>
      <path className="cp-wave" d="M2.5 7a8 8 0 0 1 2-3.5" />
      <path className="cp-wave" d="M21.5 7a8 8 0 0 0-2-3.5" />
      <circle cx="18" cy="5" r="2.6" fill="#E11D48" stroke="#EEF0FF" strokeWidth="1.4" />
    </svg>
  );
}

export function EnvelopePlaneIcon() {
  return (
    <svg {...base} strokeLinejoin="round">
      <rect x="2.5" y="8" width="15" height="12" rx="2" />
      <path d="m2.5 9.5 7.5 5 7.5-5" />
      <g className="cp-plane">
        <path d="M22 2.5 14.5 5.3l3 1.3 1.3 3z" fill="#D4F75B" />
      </g>
    </svg>
  );
}

export function LayersIcon() {
  return (
    <svg {...base} strokeLinejoin="round">
      <path className="cp-stack" d="m12 3 9 4.5-9 4.5-9-4.5z" fill="#D4F75B" />
      <path className="cp-stack" style={{ animationDelay: "0.2s" }} d="m3 12 9 4.5 9-4.5" />
      <path className="cp-stack" style={{ animationDelay: "0.4s" }} d="m3 16.5 9 4.5 9-4.5" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg {...base} width={32} height={32}>
      <circle cx="12" cy="12" r="9.5" />
      <path className="cp-drawloop" style={{ ["--len" as string]: 16 }} d="m7.5 12.5 3 3 6-6.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InvitePulseIcon() {
  return (
    <svg {...base} width={32} height={32} strokeLinecap="round">
      <circle className="cp-ripple" cx="10" cy="12" r="9" strokeOpacity="0.5" />
      <circle cx="10" cy="9" r="3.2" />
      <path d="M4.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M19 8v5M16.5 10.5h5" />
    </svg>
  );
}

export function BarsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
      {[4, 10, 16].map((x, i) => (
        <rect key={x} className="cp-bars" x={x} y="5" width="4" height="14" rx="1.5" fill={i === 2 ? "#0F766E" : "#4338CA"} style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
    </svg>
  );
}
