"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FormError, TextField } from "@/components/ui/Field";
import { logout, memberInfo, resetPassword, updateDisplayName } from "@/lib/firebase-actions";
import { useApp } from "./AppProvider";
import { PageBody, PageHeader } from "./PageHeader";

export function SettingsView() {
  const { user } = useApp();
  const router = useRouter();
  const info = memberInfo(user);
  const [name, setName] = useState(info.name);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usesPassword = user.providerData.some((p) => p.providerId === "password");

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Please enter your name.");
    setSaving(true);
    setError(null);
    try {
      await updateDisplayName(user, name.trim());
      setNotice("Profile updated. New comments and invites will use this name.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your name.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReset() {
    await resetPassword(info.email);
    setNotice(`We sent a password reset link to ${info.email}.`);
  }

  return (
    <PageBody>
      <PageHeader title="Settings" />
      <section className="card flex max-w-2xl flex-col gap-5 rounded-[20px] p-6">
        <div className="flex items-center gap-4">
          <Avatar id={user.uid} name={info.name} photoURL={info.photoURL} size={56} />
          <div>
            <p className="font-semibold">{info.name}</p>
            <p className="text-sm text-muted">{info.email}</p>
          </div>
        </div>
        <form onSubmit={saveName} className="flex flex-col gap-4">
          <TextField label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <FormError message={error} />
          {notice && <p className="cp-in rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
          <div className="flex flex-wrap gap-2.5">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            {usesPassword && (
              <Button variant="secondary" onClick={sendReset}>
                Email me a password reset link
              </Button>
            )}
          </div>
        </form>
      </section>
      <section className="card flex max-w-2xl flex-wrap items-center justify-between gap-4 rounded-[20px] p-6">
        <div>
          <p className="font-semibold">Log out</p>
          <p className="text-sm text-muted">Sign out of Coplan on this device.</p>
        </div>
        <Button
          variant="secondary"
          className="text-danger"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
        >
          <LogOut className="size-4" /> Log out
        </Button>
      </section>
    </PageBody>
  );
}
