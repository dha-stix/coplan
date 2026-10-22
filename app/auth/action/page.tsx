import type { Metadata } from "next";
import { shareMetadata } from "@/lib/site";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailActionHandler } from "@/components/auth/EmailActionHandler";
import { PageLoader } from "@/components/ui/Spinner";

export const metadata: Metadata = shareMetadata("Reset your password", "Choose a new password for your Coplan account.");

/** Target of Firebase's email links (set as the custom action URL in the Firebase console). */
export default function EmailActionPage() {
  return (
    <AuthShell redirectSignedIn={false}>
      <Suspense fallback={<PageLoader label="Checking your link" />}>
        <EmailActionHandler />
      </Suspense>
    </AuthShell>
  );
}
