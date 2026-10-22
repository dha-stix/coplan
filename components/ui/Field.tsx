"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string | null;
  labelAction?: ReactNode;
  trailing?: ReactNode;
}

export function TextField({ label, icon, error, labelAction, trailing, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-semibold">
          {label}
        </label>
        {labelAction}
      </div>
      <div className={cn("input-shell", trailing && "pr-1.5", error && "border-danger")}>
        {icon && <span className="text-muted [&>svg]:size-[18px]">{icon}</span>}
        <input id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="input-bare" {...props} />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex size-10 items-center justify-center rounded-lg text-muted transition hover:bg-soft"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      }
    />
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="cp-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}
