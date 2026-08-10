import { type ReactNode } from "react";

import { DashboardShell } from "@/ui/layouts/DashboardShell";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle,
  headerActions,
}: DashboardLayoutProps) {
  return (
    <DashboardShell title={title} subtitle={subtitle} headerActions={headerActions}>
      {children}
    </DashboardShell>
  );
}
