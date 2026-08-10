"use client";

import { type ReactNode } from "react";

import { CommandPalette, Header, MobileSidebar, Sidebar } from "@/ui/components/navigation";
import { useAppStore } from "@/ui/stores/app.store";
import type { NavigationRoute } from "@/ui/constants/routes";
import { cn } from "@/ui/utils/cn";

interface DashboardShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  navigation?: NavigationRoute[];
  brandLabel?: string;
  brandSubtitle?: string;
  brandShortLabel?: string;
}

export function DashboardShell({
  children,
  title,
  subtitle,
  headerActions,
  navigation,
  brandLabel,
  brandSubtitle,
  brandShortLabel,
}: DashboardShellProps) {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar navigation={navigation} brandLabel={brandLabel} brandSubtitle={brandSubtitle} brandShortLabel={brandShortLabel} />
      <MobileSidebar navigation={navigation} brandLabel={brandLabel} brandSubtitle={brandSubtitle} brandShortLabel={brandShortLabel} />
      <CommandPalette />

      <div
        className={cn(
          "min-h-screen transition-[padding-left] duration-200 lg:pl-[260px]",
          sidebarCollapsed && "lg:pl-[72px]",
        )}
      >
        <Header title={title} subtitle={subtitle} actions={headerActions} />

        <main className="p-4 lg:p-6">
          <div className="mx-auto w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
