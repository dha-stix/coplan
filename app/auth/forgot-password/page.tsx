import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = shareMetadata("Reset your password", "Forgot your Coplan password? We will email you a link to reset it.");

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
