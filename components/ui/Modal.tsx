"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Max-width class for the dialog panel. */
  width?: string;
  /** Hide the built-in header when the content renders its own. */
  bare?: boolean;
}

export function Modal({ open, onClose, title, description, children, className, width = "max-w-lg", bare }: ModalProps) {
  const titleId = useId();
  const pressedBackdrop = useRef(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Escape closes the dialog unless something inside (a menu, the @mention list) already handled it.
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !e.defaultPrevented && onClose();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Move keyboard focus into the dialog (unless a field autofocused), and give it back on close.
    const opener = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      if (panel.current && !panel.current.contains(document.activeElement)) panel.current.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  // Render into <body> so a parent with a transform, filter or backdrop blur (like the
  // sticky top bar) can't trap the fixed overlay inside itself.
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink/55 p-0 backdrop-blur-[2px] sm:items-start sm:p-4 sm:pt-[8vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Close only on a full click on the dimmed backdrop. Grabbing the overlay's scrollbar
          // (which sits on the backdrop) or dragging out of a text field must not close it.
          onPointerDown={(e) => {
            const onScrollbar = e.clientX >= e.currentTarget.clientWidth;
            pressedBackdrop.current = e.target === e.currentTarget && !onScrollbar;
          }}
          onClick={(e) => {
            if (pressedBackdrop.current && e.target === e.currentTarget) onClose();
            pressedBackdrop.current = false;
          }}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={cn("relative w-full rounded-t-3xl bg-white shadow-pop outline-none sm:rounded-3xl", width, className)}
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            {!bare && (
              <div className="flex items-start gap-3 px-6 pt-6 sm:px-7 sm:pt-7">
                <div className="flex flex-1 flex-col gap-1.5">
                  {title && (
                    <h2 id={titleId} className="font-display text-2xl font-bold tracking-[-0.02em]">
                      {title}
                    </h2>
                  )}
                  {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
                </div>
                <CloseButton onClick={onClose} />
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-soft text-ink transition hover:bg-line", className)}
    >
      <X className="size-4" />
    </button>
  );
}
