import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type AppConfigIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type UserDropdownLink = {
  label: string;
  href: string;
  icon: AppConfigIcon;
};

export const appConfig = {
  brand: {
    label: "Control Panel",
    subtitle: "Workspace",
    shortLabel: "UI",
  },
  user: {
    fallbackName: "Admin User",
    fallbackEmail: "admin@example.com",
    dropdownLinks: [
      { label: "Profile", href: "/profile", icon: UserCircleIcon },
      { label: "Settings", href: "/settings", icon: Cog6ToothIcon },
    ] satisfies UserDropdownLink[],
    logout: {
      label: "Logout",
      icon: ArrowRightStartOnRectangleIcon,
    },
  },
} as const;
