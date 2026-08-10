"use client";

import {
  BellIcon,
  BellSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/ui/components/common/Button";
import { ScrollArea } from "@/ui/components/common/ScrollArea";
import { useNotificationStore } from "@/ui/stores/notification.store";
import { cn } from "@/ui/utils/cn";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const items = useNotificationStore((state) => state.items);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        ) : null}
      </button>

      <div
        className={cn(
          "absolute right-0 top-12 z-30 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 transition-all duration-200",
          "dark:border-slate-700 dark:bg-slate-900 dark:shadow-none",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={markAllAsRead}>
            Mark all read
          </Button>
        </div>

        <ScrollArea className="pr-1" viewportClassName="max-h-80" fadeEdges hideScrollbarUntilHover>
          <div className="space-y-2">
          {sortedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center dark:border-slate-700 dark:bg-slate-800/60">
              <BellSlashIcon className="mx-auto h-6 w-6 text-slate-400 dark:text-slate-500" aria-hidden="true" />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No notifications.</p>
            </div>
          ) : (
            sortedItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => markAsRead(item.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition",
                  item.read
                    ? "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    : "border-sky-100 bg-sky-50/80 hover:bg-sky-100/70 dark:border-sky-500/30 dark:bg-sky-500/10 dark:hover:bg-sky-500/15",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
                  </div>

                  {!item.read ? (
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-300" aria-hidden="true" />
                  ) : null}
                </div>
              </button>
            ))
          )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
