import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import notFoundArt from "@/images/not-found.svg";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-6">
      <Logo />
      <main className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
        <Image src={notFoundArt} alt="" width={280} height={200} className="cp-float" />
        <h1 className="font-display text-[clamp(30px,4vw,44px)] font-bold tracking-[-0.03em]">This card fell off the board</h1>
        <p className="max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/" variant="secondary" size="lg">
            Go home
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg">
            Open dashboard
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
