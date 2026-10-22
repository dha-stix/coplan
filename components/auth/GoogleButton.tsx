"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/Icons";
import { authErrorMessage, signInWithGoogle } from "@/lib/firebase-actions";
import { isFirebaseConfigured } from "@/lib/firebase";

interface GoogleButtonProps {
  label: string;
  onError: (message: string | null) => void;
  remember?: boolean;
}

/** Signs in with the Google popup. AuthShell redirects once the session exists. */
export function GoogleButton({ label, onError, remember = true }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    onError(null);
    setLoading(true);
    try {
      await signInWithGoogle(remember);
    } catch (error) {
      onError(authErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="lg" className="w-full border-line-2 shadow-card" onClick={handleClick} loading={loading} disabled={!isFirebaseConfigured}>
      {!loading && <GoogleIcon />}
      {label}
    </Button>
  );
}
