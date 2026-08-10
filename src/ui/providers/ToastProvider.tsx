"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ToastContainer,
} from "@/ui/components/feedback/ToastContainer";
import { type ToastItem, type ToastPosition, type ToastVariant } from "@/ui/components/feedback/Toast";

interface ToastProviderProps {
  children: ReactNode;
  maxVisible?: number;
}

export interface ToastShowOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: number;
  autoClose?: boolean;
  showProgress?: boolean;
}

interface ToastShortcutOptions {
  description?: string;
  position?: ToastPosition;
  duration?: number;
  autoClose?: boolean;
  showProgress?: boolean;
}

export interface ToastAPI {
  show: (options: ToastShowOptions) => string;
  success: (title: string, options?: ToastShortcutOptions) => string;
  error: (title: string, options?: ToastShortcutOptions) => string;
  warning: (title: string, options?: ToastShortcutOptions) => string;
  info: (title: string, options?: ToastShortcutOptions) => string;
  default: (title: string, options?: ToastShortcutOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

const DEFAULT_DURATION = 3000;
const EXIT_DELAY_MS = 220;

export function ToastProvider({ children, maxVisible = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const removeTimeoutsRef = useRef<Map<string, number>>(new Map());

  const pruneByPosition = useCallback(
    (items: ToastItem[], position: ToastPosition) => {
      const scoped = items.filter((item) => item.position === position);
      if (scoped.length <= maxVisible) {
        return items;
      }

      const overflowCount = scoped.length - maxVisible;
      const removeIds = new Set(scoped.slice(0, overflowCount).map((item) => item.id));

      return items.filter((item) => !removeIds.has(item.id));
    },
    [maxVisible],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target || target.isExiting) {
        return prev;
      }

      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isExiting: true,
            }
          : item,
      );
    });

    if (removeTimeoutsRef.current.has(id)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
      removeTimeoutsRef.current.delete(id);
    }, EXIT_DELAY_MS);

    removeTimeoutsRef.current.set(id, timeout);
  }, []);

  const show = useCallback(
    (options: ToastShowOptions) => {
      const id = crypto.randomUUID();
      const nextToast: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        position: options.position ?? "top-right",
        duration: options.duration ?? DEFAULT_DURATION,
        autoClose: options.autoClose ?? true,
        showProgress: options.showProgress ?? true,
        isExiting: false,
      };

      setToasts((prev) => {
        const merged = [...prev, nextToast];
        return pruneByPosition(merged, nextToast.position);
      });

      return id;
    },
    [pruneByPosition],
  );

  const buildShortcut = useCallback(
    (variant: ToastVariant) => {
      return (title: string, options?: ToastShortcutOptions) => {
        return show({
          title,
          description: options?.description,
          position: options?.position,
          duration: options?.duration,
          autoClose: options?.autoClose,
          showProgress: options?.showProgress,
          variant,
        });
      };
    },
    [show],
  );

  const clear = useCallback(() => {
    setToasts([]);

    removeTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    removeTimeoutsRef.current.clear();
  }, []);

  useEffect(() => {
    const timeoutMap = removeTimeoutsRef.current;

    return () => {
      timeoutMap.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timeoutMap.clear();
    };
  }, []);

  const contextValue = useMemo<ToastAPI>(
    () => ({
      show,
      success: buildShortcut("success"),
      error: buildShortcut("error"),
      warning: buildShortcut("warning"),
      info: buildShortcut("info"),
      default: buildShortcut("default"),
      dismiss,
      clear,
    }),
    [show, buildShortcut, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
