import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface AppStore {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  theme: "system",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => {
    const currentTheme = get().theme;

    if (currentTheme === "system") {
      set({ theme: "dark" });
      return;
    }

    set({ theme: currentTheme === "light" ? "dark" : "light" });
  },
}));
