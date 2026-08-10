"use client";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { type CSSProperties, useCallback, useEffect, useRef } from "react";

import { cn } from "@/ui/utils/cn";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  position: ToastPosition;
  duration: number;
  autoClose: boolean;
  showProgress: boolean;
  isExiting: boolean;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const toneStyles: Record<
  ToastVariant,
  {
    container: string;
    title: string;
    description: string;
    icon: typeof InformationCircleIcon;
    iconClass: string;
    progress: string;
  }
> = {
  default: {
    container: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
    title: "text-slate-900 dark:text-slate-100",
    description: "text-slate-600 dark:text-slate-300",
    icon: InformationCircleIcon,
    iconClass: "text-slate-600 dark:text-slate-300",
    progress: "bg-slate-700",
  },
  success: {
    container: "border-emerald-100 bg-emerald-50",
    title: "text-emerald-900",
    description: "text-emerald-800",
    icon: CheckCircleIcon,
    iconClass: "text-emerald-600",
    progress: "bg-emerald-600",
  },
  error: {
    container: "border-rose-100 bg-rose-50",
    title: "text-rose-900",
    description: "text-rose-800",
    icon: ExclamationCircleIcon,
    iconClass: "text-rose-600",
    progress: "bg-rose-600",
  },
  warning: {
    container: "border-amber-100 bg-amber-50",
    title: "text-amber-900",
    description: "text-amber-800",
    icon: ExclamationTriangleIcon,
    iconClass: "text-amber-600",
    progress: "bg-amber-500",
  },
  info: {
    container: "border-sky-100 bg-sky-50",
    title: "text-sky-900",
    description: "text-sky-800",
    icon: InformationCircleIcon,
    iconClass: "text-sky-600",
    progress: "bg-sky-600",
  },
};

function getPositionAnimationKey(position: ToastPosition) {
  if (position.includes("right")) {
    return "right";
  }

  if (position.includes("left")) {
    return "left";
  }

  if (position.startsWith("top")) {
    return "top";
  }

  return "bottom";
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const style = toneStyles[toast.variant];
  const Icon = style.icon;
  const animationKey = getPositionAnimationKey(toast.position);

  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingMsRef = useRef(toast.duration);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!toast.autoClose || toast.isExiting) {
      return;
    }

    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remainingMsRef.current);
  }, [toast.autoClose, toast.id, toast.isExiting, onDismiss]);

  useEffect(() => {
    if (!toast.autoClose || toast.isExiting) {
      clearTimer();
      return;
    }

    remainingMsRef.current = toast.duration;
    startTimer();

    return () => {
      clearTimer();
    };
  }, [toast.autoClose, toast.duration, toast.isExiting, clearTimer, startTimer]);

  function handleMouseEnter() {
    if (!toast.autoClose || toast.isExiting) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearTimer();
  }

  function handleMouseLeave() {
    if (!toast.autoClose || toast.isExiting || remainingMsRef.current <= 0) {
      return;
    }

    startTimer();
  }

  const progressStyle: CSSProperties | undefined = toast.autoClose && toast.showProgress
    ? {
        animationDuration: `${toast.duration}ms`,
      }
    : undefined;

  return (
    <div
      className={cn(
        "group pointer-events-auto relative w-full rounded-lg border p-3 shadow-lg",
        style.container,
        toast.isExiting ? `ui-toast-exit-${animationKey}` : `ui-toast-enter-${animationKey}`,
      )}
      role="status"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClass)} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", style.title)}>{toast.title}</p>
          {toast.description ? (
            <p className={cn("mt-1 text-sm leading-5", style.description)}>{toast.description}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded p-1 text-slate-500 dark:text-slate-400 transition hover:bg-black/5 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          onClick={() => onDismiss(toast.id)}
          aria-label="Close toast"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {toast.autoClose && toast.showProgress ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-lg bg-white dark:bg-slate-900/50">
          <div
            key={`toast-progress-${toast.id}`}
            className={cn(
              "ui-progress-animate h-full [animation-play-state:running] group-hover:[animation-play-state:paused]",
              style.progress,
            )}
            style={progressStyle}
          />
        </div>
      ) : null}
    </div>
  );
}
