export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  analytics: "/analytics",
  users: "/users",
  settings: "/settings",
  profile: "/profile",
  signIn: "/sign-in",
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];

export type NavigationIconKey = "home" | "chart" | "users" | "settings";

export interface NavigationRoute {
  label: string;
  href: RouteValue;
  icon: NavigationIconKey;
}

export const DASHBOARD_NAVIGATION: NavigationRoute[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: "home" },
  { label: "Analytics", href: ROUTES.analytics, icon: "chart" },
  { label: "Users", href: ROUTES.users, icon: "users" },
  { label: "Settings", href: ROUTES.settings, icon: "settings" },
];
