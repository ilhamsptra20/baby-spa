import { create } from "zustand";

export type NotificationTone = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationTone;
  createdAt: string;
  read: boolean;
}

interface NotificationStore {
  items: NotificationItem[];
  toasts: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissToast: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "notice-1",
    title: "Welcome",
    message: "Your shared UI template is ready for integration.",
    type: "info",
    createdAt: new Date().toISOString(),
    read: false,
  },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: defaultNotifications,
  toasts: defaultNotifications,
  unreadCount: defaultNotifications.filter((item) => !item.read).length,
  addNotification: (notification) => {
    const newItem: NotificationItem = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((state) => {
      const nextItems = [newItem, ...state.items];

      return {
        items: nextItems,
        toasts: [newItem, ...state.toasts],
        unreadCount: nextItems.filter((item) => !item.read).length,
      };
    });
  },
  markAsRead: (id) => {
    set((state) => {
      const nextItems = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item,
      );

      return {
        items: nextItems,
        unreadCount: nextItems.filter((item) => !item.read).length,
      };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        read: true,
      })),
      unreadCount: 0,
    }));
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearNotifications: () => {
    set({
      items: [],
      toasts: [],
      unreadCount: 0,
    });
  },
}));

export function selectLatestNotifications(limit = 5) {
  const items = useNotificationStore.getState().items;
  return [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
