import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import { RegisterPanel } from "@/components/auth/AuthPanels";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = shareMetadata("Create your account", "Create a free Coplan workspace in seconds and invite your team by email.");

export default function RegisterPage() {
  return (
    <AuthShell aside={<RegisterPanel />} asideFirst>
      <RegisterForm />
    </AuthShell>
  );
}
