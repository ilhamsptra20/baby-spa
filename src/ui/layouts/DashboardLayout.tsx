import { type ReactNode } from "react";

import { DashboardShell } from "@/ui/layouts/DashboardShell";
import type { NavigationRoute } from "@/ui/constants/routes";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  navigation?: NavigationRoute[];
  brandLabel?: string;
  brandSubtitle?: string;
  brandShortLabel?: string;
}

export function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle,
  headerActions,
  navigation,
  brandLabel,
  brandSubtitle,
  brandShortLabel,
}: DashboardLayoutProps) {
  return (
    <DashboardShell
      title={title}
      subtitle={subtitle}
      headerActions={headerActions}
      navigation={navigation}
      brandLabel={brandLabel}
      brandSubtitle={brandSubtitle}
      brandShortLabel={brandShortLabel}
    >
      {children}
    </DashboardShell>
  );
}
