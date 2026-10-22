import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how", label: "How it works" },
      { href: "/#roles", label: "Roles" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/auth/login", label: "Log in" },
      { href: "/auth/register", label: "Sign up" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "mailto:asaoludavid234@gmail.com", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-8 px-4 py-12 sm:px-5">
        <div className="flex max-w-[280px] flex-col gap-3">
          <Logo />
          <span className="text-sm leading-relaxed text-muted">Shared boards for teams that ship.</span>
        </div>
        <div className="flex flex-wrap gap-14 text-sm">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <strong>{col.title}</strong>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="text-muted transition hover:text-ink">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-5 text-[13px] text-muted sm:px-5">
        <span>© {new Date().getFullYear()} Coplan. All rights reserved.</span>
        <span>
          Built by{" "}
          <a href="https://www.linkedin.com/in/david-asaolu234/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:text-brand-600">
            David Asaolu
          </a>
        </span>
      </div>
    </footer>
  );
}
