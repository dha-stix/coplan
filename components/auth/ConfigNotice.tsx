import { isFirebaseConfigured } from "@/lib/firebase";

/** Shown in place of a broken sign-in while the Firebase keys are still missing. */
export function ConfigNotice() {
  if (isFirebaseConfigured) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
      <strong>Firebase isn&apos;t connected yet.</strong> Copy <code className="font-mono text-[13px]">.env.example</code> to{" "}
      <code className="font-mono text-[13px]">.env.local</code>, add your Firebase web app keys and restart the dev server.
    </div>
  );
}
