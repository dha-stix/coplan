import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-5 lg:pb-28">
      <Reveal>
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-[32px] bg-brand px-6 py-[clamp(40px,7vw,88px)] text-center text-white">
          <svg aria-hidden="true" viewBox="0 0 1200 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full">
            <path className="cp-flow" d="M-20 330 C 200 210, 380 390, 600 270 S 1000 130, 1220 230" fill="none" stroke="#D4F75B" strokeOpacity="0.55" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path className="cp-flow" style={{ animationDuration: "1.8s" }} d="M-20 70 C 240 170, 420 10, 640 110 S 980 290, 1220 130" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <h2 className="relative max-w-3xl font-display text-[clamp(34px,5vw,60px)] font-bold leading-[1.02] tracking-[-0.035em]">Bring your team onto one board.</h2>
          <p className="relative max-w-[520px] text-lg leading-relaxed text-brand-tint">Create a workspace in seconds with Google or your email, then invite teammates by email.</p>
          <ButtonLink href="/auth/register" variant="lime" size="lg" className="relative font-bold">
            Get started — it&apos;s free
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
