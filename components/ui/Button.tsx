import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const variants = {
  primary: "bg-brand text-white shadow-[0_8px_24px_rgba(67,56,202,0.25)] hover:bg-brand-600",
  dark: "bg-ink text-white shadow-[0_10px_24px_rgba(14,16,32,0.18)] hover:bg-night-2",
  secondary: "border border-line bg-white text-ink hover:border-line-2 hover:bg-canvas",
  ghost: "text-ink-2 hover:bg-soft",
  lime: "bg-lime text-ink hover:brightness-95",
  danger: "text-danger hover:bg-red-50",
} as const;

const sizes = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "min-h-[52px] gap-2.5 rounded-[14px] px-5 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant, size, className, loading, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} className={buttonClasses({ variant, size, className })} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
