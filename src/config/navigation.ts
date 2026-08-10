import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  SparklesIcon,
  Squares2X2Icon,
  TableCellsIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

import type { NavigationIconKey, NavigationRoute } from "@/ui/constants/routes";

export type NavigationIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarMenuChild = {
  label: string;
  href: string;
};

export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: NavigationIcon;
  badge?: "NEW";
  children?: SidebarMenuChild[];
};

export type SidebarMenuGroup = {
  label: string;
  items: SidebarMenuItem[];
};

export const navigationIconMap: Record<NavigationIconKey, NavigationIcon> = {
  home: HomeIcon,
  chart: ChartBarSquareIcon,
  users: UserCircleIcon,
  settings: Cog6ToothIcon,
  calendar: CalendarDaysIcon,
  list: ClipboardDocumentListIcon,
  sparkles: SparklesIcon,
  package: ShoppingBagIcon,
};

export const sidebarMenuGroups: SidebarMenuGroup[] = [
  {
    label: "MENU",
    items: [
      { label: "Dashboard", href: "/", icon: HomeIcon },
      { label: "AI Assistant", href: "/ai-assistant", icon: SparklesIcon, badge: "NEW" },
      { label: "E-commerce", href: "/ecommerce", icon: ShoppingBagIcon },
      { label: "Calendar", href: "/calendar", icon: CalendarDaysIcon },
      { label: "User Profile", href: "/profile", icon: UserCircleIcon },
      { label: "Task", href: "/task", icon: ClipboardDocumentListIcon },
      {
        label: "Forms",
        href: "/forms",
        icon: Squares2X2Icon,
        children: [
          { label: "Input", href: "/forms/input" },
          { label: "Select", href: "/forms/select" },
          { label: "Text Editor", href: "/forms/text-editor" },
        ],
      },
      {
        label: "Tables",
        href: "/tables",
        icon: TableCellsIcon,
        children: [
          { label: "Data Table", href: "/tables/data-table" },
          { label: "Table", href: "/tables/table" },
          { label: "Pagination", href: "/tables/pagination" },
        ],
      },
      {
        label: "Pages",
        href: "/pages",
        icon: DocumentDuplicateIcon,
        children: [
          { label: "Header", href: "/pages/header" },
          { label: "Modal", href: "/pages/modal" },
          { label: "Toast", href: "/pages/toast" },
        ],
      },
      {
        label: "Layouts",
        href: "/layouts",
        icon: RectangleGroupIcon,
        badge: "NEW",
        children: [
          { label: "Dashboard", href: "/layouts/dashboard" },
          { label: "Auth", href: "/layouts/auth" },
          { label: "Public", href: "/layouts/public" },
        ],
      },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Chat", href: "/chat", icon: ChatBubbleLeftRightIcon },
      { label: "Email", href: "/email", icon: EnvelopeIcon },
      { label: "Invoice", href: "/invoice", icon: DocumentTextIcon },
    ],
  },
];

export function createSidebarMenuGroups(
  navigation?: NavigationRoute[],
): SidebarMenuGroup[] {
  if (!navigation?.length) {
    return sidebarMenuGroups;
  }

  return [
    {
      label: "MENU",
      items: navigation.map((item) => ({
        label: item.label,
        href: item.href,
        icon: navigationIconMap[item.icon],
      })),
    },
  ];
}

export function isNavigationRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getSidebarItemKey(groupLabel: string, itemLabel: string) {
  return `${groupLabel}-${itemLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function hasActiveSidebarChildren(pathname: string, item: SidebarMenuItem) {
  return (
    item.children?.some((child) => isNavigationRouteActive(pathname, child.href)) ??
    false
  );
}
