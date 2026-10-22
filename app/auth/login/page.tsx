import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import Link from "next/link";
import { LoginPanel } from "@/components/auth/AuthPanels";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = shareMetadata("Log in", "Log in to Coplan with Google or email and pick up where your team left off.");

export default function LoginPage() {
  return (
    <AuthShell
      aside={<LoginPanel />}
      footer={
        <p className="text-xs text-muted">
          By continuing you agree to our{" "}
          <Link href="/#faq" className="text-brand">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/#faq" className="text-brand">
            Privacy Policy
          </Link>
          .
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
