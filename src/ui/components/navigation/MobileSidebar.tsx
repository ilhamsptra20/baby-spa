"use client";

import {
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ScrollArea } from "@/ui/components/common";
import {
  appConfig,
  createSidebarMenuGroups,
  getSidebarItemKey,
  hasActiveSidebarChildren,
  isNavigationRouteActive,
  type SidebarMenuGroup,
} from "@/config";
import type { NavigationRoute } from "@/ui/constants/routes";
import { useAppStore } from "@/ui/stores/app.store";
import { cn } from "@/ui/utils/cn";

interface MobileSidebarProps {
  className?: string;
  navigation?: NavigationRoute[];
  brandLabel?: string;
  scrollbarVisibility?: "always" | "hover";
}

export function MobileSidebar({
  className,
  navigation,
  brandLabel = appConfig.brand.label,
  scrollbarVisibility = "hover",
}: MobileSidebarProps) {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const closeSidebar = useAppStore((state) => state.closeSidebar);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const menuGroups: SidebarMenuGroup[] = createSidebarMenuGroups(navigation);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <div className="lg:hidden">
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-[2px] transition duration-200 dark:bg-slate-950/70",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-200/80 bg-white",
          "transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        aria-label="Mobile sidebar"
      >
        <div className="flex h-[84px] items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white shadow-sm shadow-sky-100">
              {appConfig.brand.shortLabel}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">{brandLabel}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{appConfig.brand.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <ScrollArea
          className="flex-1 min-h-0"
          viewportClassName="ui-scrollbar-stable-hover"
          fadeEdges
          fillContainer
          hideScrollbarUntilHover={scrollbarVisibility === "hover"}
        >
          <nav className="space-y-6 px-3 py-5">
            {menuGroups.map((group) => (
              <section key={group.label}>
                <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>

                <ul className="mt-2.5 space-y-1.5">
                  {group.items.map((item) => {
                    const hasChildren = Boolean(item.children?.length);
                    const isChildActive = hasActiveSidebarChildren(pathname, item);
                    const isActive = isNavigationRouteActive(pathname, item.href) || isChildActive;
                    const itemKey = getSidebarItemKey(group.label, item.label);
                    const isExpanded = expandedItems[itemKey] ?? isChildActive;
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        {hasChildren ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedItems((previous) => ({
                                  ...previous,
                                  [itemKey]: !(previous[itemKey] ?? isChildActive),
                                }));
                              }}
                              aria-expanded={isExpanded}
                              aria-controls={`${itemKey}-submenu`}
                              className={cn(
                                "group flex h-11 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium transition-colors duration-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
                                isActive
                                  ? "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-5 w-5 shrink-0",
                                  isActive ? "text-sky-600 dark:text-sky-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                                )}
                                aria-hidden="true"
                              />

                              <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>

                              {item.badge ? (
                                <span className="inline-flex h-5 items-center rounded-md bg-sky-100 px-1.5 text-[10px] font-semibold tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                                  {item.badge}
                                </span>
                              ) : null}

                              <ChevronDownIcon
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-transform duration-200",
                                  isExpanded ? "rotate-180 text-sky-500 dark:text-sky-300" : "text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400",
                                )}
                                aria-hidden="true"
                              />
                            </button>

                            <div
                              className={cn(
                                "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out",
                                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                              )}
                            >
                              <ul id={`${itemKey}-submenu`} className="space-y-1 overflow-hidden pb-0.5 pl-10 pr-1 pt-1">
                                {item.children?.map((child) => {
                                  const isChildItemActive = isNavigationRouteActive(pathname, child.href);

                                  return (
                                    <li key={child.href}>
                                      <Link
                                        href={child.href}
                                        className={cn(
                                          "flex h-8 items-center rounded-lg px-2 text-xs font-medium transition",
                                          isChildItemActive
                                            ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200",
                                        )}
                                      >
                                        <span className="truncate">{child.label}</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex h-11 items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-medium transition-colors duration-200",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
                              isActive
                                ? "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                isActive ? "text-sky-600 dark:text-sky-300" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300",
                              )}
                              aria-hidden="true"
                            />

                            <span className="min-w-0 flex-1 truncate">{item.label}</span>

                            {item.badge ? (
                              <span className="inline-flex h-5 items-center rounded-md bg-sky-100 px-1.5 text-[10px] font-semibold tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </div>
  );
}
