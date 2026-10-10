"use client";

import { useRef, type ReactNode, type TouchEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MdDashboard, MdList, MdPerson, MdRestaurantMenu } from "react-icons/md";

const tabs = [
  { label: "Home", icon: MdDashboard, href: "/dashboard" },
  { label: "Restaurants", icon: MdRestaurantMenu, href: "/dashboard?tab=restaurants" },
  { label: "Profile", icon: MdPerson, href: "/profile" },
  { label: "Saved", icon: MdList, href: "/plans" },
];

export default function MobileAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isAppPage = pathname === "/dashboard" || pathname === "/profile" || pathname === "/plans";
  const activeIndex = pathname === "/profile"
    ? 2
    : pathname === "/plans"
      ? 3
      : pathname === "/dashboard" && searchParams.get("tab") === "restaurants"
        ? 1
        : 0;

  const screenKey = pathname;

  const navigateToTab = (index: number) => {
    const tab = tabs[index];
    if (index === 0 && pathname === "/dashboard") {
      window.dispatchEvent(new Event("climadiet:return-home"));
    }
    if (tab && index !== activeIndex) router.push(tab.href);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [contenteditable='true'], [role='dialog'], [data-no-page-swipe]")) {
      touchStart.current = null;
      return;
    }
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    navigateToTab(Math.max(0, Math.min(tabs.length - 1, activeIndex + (dx < 0 ? 1 : -1))));
  };

  return (
    <div
      className={isAppPage ? "min-h-screen pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:pb-0" : "min-h-screen"}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screenKey}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {isAppPage && (
        <nav
          aria-label="Main navigation"
          className="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-4 border-t border-border bg-background/95 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.07)] backdrop-blur-xl sm:hidden print:hidden"
        >
          {tabs.map(({ label, icon: Icon }, index) => {
            const active = activeIndex === index;
            return (
              <button
                key={label}
                type="button"
                onClick={() => navigateToTab(index)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-semibold transition-colors ${active ? "text-brand" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
