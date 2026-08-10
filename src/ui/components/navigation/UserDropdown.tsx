"use client";

import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { appConfig } from "@/config";
import { useAuthStore } from "@/ui/stores/auth.store";
import { cn } from "@/ui/utils/cn";

interface UserDropdownProps {
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserDropdown({ className }: UserDropdownProps) {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const userName = user?.name ?? appConfig.user.fallbackName;
  const userEmail = user?.email ?? appConfig.user.fallbackEmail;
  const initials = useMemo(() => getInitials(userName), [userName]);
  const LogoutIcon = appConfig.user.logout.icon;

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
        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-1.5 pr-2.5 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Toggle user menu"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
          {initials}
        </span>
        <span className="hidden text-sm font-medium md:inline-block">{userName}</span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "absolute right-0 top-12 z-30 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 transition-all duration-200",
          "dark:border-slate-700 dark:bg-slate-900 dark:shadow-none",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
        role="menu"
      >
        <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
        </div>

        <div className="mt-2 space-y-1">
          {appConfig.user.dropdownLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
            onClick={() => {
              clearSession();
              setOpen(false);
            }}
          >
            <LogoutIcon className="h-4 w-4" aria-hidden="true" />
            {appConfig.user.logout.label}
          </button>
        </div>
      </div>
    </div>
  );
}
