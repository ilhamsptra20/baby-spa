"use client";

import { type ToastItem, type ToastPosition, Toast } from "@/ui/components/feedback/Toast";
import { cn } from "@/ui/utils/cn";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const positions: ToastPosition[] = [
  "top-right",
  "top-left",
  "top-center",
  "bottom-right",
  "bottom-left",
  "bottom-center",
];

function getContainerClass(position: ToastPosition) {
  switch (position) {
    case "top-left":
      return "left-4 top-4 items-start";
    case "top-center":
      return "left-1/2 top-4 -translate-x-1/2 items-center";
    case "bottom-right":
      return "right-4 bottom-4 items-end";
    case "bottom-left":
      return "left-4 bottom-4 items-start";
    case "bottom-center":
      return "left-1/2 bottom-4 -translate-x-1/2 items-center";
    case "top-right":
    default:
      return "right-4 top-4 items-end";
  }
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <>
      {positions.map((position) => {
        const scopedToasts = toasts.filter((toast) => toast.position === position);

        if (scopedToasts.length === 0) {
          return null;
        }

        return (
          <div
            key={position}
            className={cn(
              "pointer-events-none fixed z-[130] flex w-full max-w-sm flex-col gap-2",
              getContainerClass(position),
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {scopedToasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
          </div>
        );
      })}
    </>
  );
}
