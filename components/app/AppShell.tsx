"use client";

import { Menu, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ConfigNotice } from "@/components/auth/ConfigNotice";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth-context";
import { AppProvider } from "./AppProvider";
import { CreateProjectModal } from "./CreateProjectModal";
import { NotificationBell } from "./NotificationBell";
import { ProjectSearch } from "./ProjectSearch";
import { Sidebar } from "./Sidebar";
import { UserMenu } from "./UserMenu";

function Topbar({ onMenu }: { onMenu: () => void }) {
  const [creating, setCreating] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="flex size-11 items-center justify-center rounded-xl border border-line lg:hidden">
        <Menu className="size-5" />
      </button>
      <ProjectSearch />
      <div className="ml-auto flex items-center gap-2.5">
        <Button onClick={() => setCreating(true)} className="hidden sm:inline-flex">
          <Plus className="size-4" /> New project
        </Button>
        <Button onClick={() => setCreating(true)} aria-label="New project" className="w-11 px-0 sm:hidden">
          <Plus className="size-5" />
        </Button>
        <NotificationBell />
        <UserMenu />
      </div>
      <CreateProjectModal open={creating} onClose={() => setCreating(false)} />
    </header>
  );
}

/** Signed-in frame: guards the route, then renders sidebar, top bar and the page. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (configured && !loading && !user) router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [configured, loading, user, router, pathname]);

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
        <Logo />
        <ConfigNotice />
      </div>
    );
  }
  if (loading || !user) return <PageLoader label="Checking your session" />;

  return (
    <AppProvider user={user}>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 border-r border-line bg-white lg:block">
          <Sidebar />
        </aside>
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[288px] max-w-[85vw] bg-white shadow-pop lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              >
                <Sidebar onNavigate={() => setDrawer(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setDrawer(true)} />
          {children}
        </div>
      </div>
    </AppProvider>
  );
}
