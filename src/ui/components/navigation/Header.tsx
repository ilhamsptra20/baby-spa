"use client";

import {
  Bars3Icon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { type ReactNode, useSyncExternalStore } from "react";

import { useTheme } from "@/ui/hooks";
import { useAppStore } from "@/ui/stores/app.store";
import { cn } from "@/ui/utils/cn";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";

interface HeaderProps {
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const actionIconButtonClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100";

export function Header({ className, title, subtitle, actions }: HeaderProps) {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const themeToggleLabel = !mounted
    ? "Toggle theme"
    : resolvedTheme === "dark"
      ? "Use light theme"
      : "Use dark theme";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90",
        "dark:border-slate-800 dark:bg-slate-950/90 dark:supports-[backdrop-filter]:bg-slate-950/85",
        className,
      )}
    >
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className={cn(actionIconButtonClassName, "lg:hidden")}
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-3">
            {(title || subtitle) ? (
              <div className="hidden min-w-0 xl:block">
                {title ? <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p> : null}
                {subtitle ? <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
              </div>
            ) : null}

            <button
              type="button"
              className="group flex h-11 w-full max-w-[430px] items-center rounded-xl border border-slate-200 bg-white px-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              onClick={() => window.dispatchEvent(new Event("ui:command-palette-open"))}
              aria-label="Open command palette"
              title="Open command palette"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300" aria-hidden="true" />
              <span className="ml-3 flex-1 truncate text-sm text-slate-500 dark:text-slate-400">Search or type command...</span>
              <span className="hidden rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                Ctrl K
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions}

          <button
            type="button"
            className={actionIconButtonClassName}
            onClick={toggleTheme}
            title={themeToggleLabel}
            aria-label={themeToggleLabel}
          >
            {!mounted || resolvedTheme === "light" ? (
              <MoonIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <SunIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <NotificationDropdown className="shrink-0" />
          <UserDropdown className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
