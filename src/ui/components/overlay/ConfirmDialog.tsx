"use client";

import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { type CSSProperties, useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/ui/components/common";
import { ScrollArea } from "@/ui/components/common";
import { type ModalPosition } from "@/ui/components/overlay/Modal";
import { useDialogAccessibility } from "@/ui/hooks";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type ConfirmDialogVariant = "default" | "danger" | "warning";

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  position?: ModalPosition;
  color?: UIColor;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showProgress?: boolean;
}

interface ConfirmDialogProps extends ConfirmDialogOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantMap: Record<
  ConfirmDialogVariant,
  {
    icon: typeof InformationCircleIcon;
    iconClassName: string;
    confirmVariant: "primary" | "danger";
    color: UIColor;
    panelClassName: string;
  }
> = {
  default: {
    icon: InformationCircleIcon,
    iconClassName: "text-sky-600 dark:text-sky-300",
    confirmVariant: "primary",
    color: "sky",
    panelClassName: "border-slate-200 dark:border-slate-700",
  },
  danger: {
    icon: ExclamationCircleIcon,
    iconClassName: "text-rose-600 dark:text-rose-300",
    confirmVariant: "danger",
    color: "rose",
    panelClassName: "border-rose-200",
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconClassName: "text-amber-600 dark:text-amber-300",
    confirmVariant: "primary",
    color: "amber",
    panelClassName: "border-amber-200",
  },
};

function getWrapperPositionClass(position: ModalPosition) {
  switch (position) {
    case "top":
      return "items-start justify-center p-4 pt-8 sm:pt-10";
    case "bottom":
      return "items-end justify-center p-4 pb-8 sm:pb-10";
    case "left":
      return "items-stretch justify-start p-0";
    case "right":
      return "items-stretch justify-end p-0";
    case "center":
    default:
      return "items-center justify-center p-4";
  }
}

function getPanelPositionClass(position: ModalPosition) {
  switch (position) {
    case "left":
    case "right":
      return "h-full w-full max-w-md rounded-none border-y-0";
    case "top":
    case "bottom":
    case "center":
    default:
      return "w-full max-w-md rounded-xl";
  }
}

function getPanelAnimationClass(position: ModalPosition, open: boolean) {
  if (open) {
    return `ui-modal-enter-${position}`;
  }

  return `ui-modal-exit-${position}`;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  position = "center",
  color,
  autoClose = false,
  autoCloseDelay = 3000,
  showProgress = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantMap[variant];
  const resolvedColor = color ?? config.color;
  const Icon = config.icon;

  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingMsRef = useRef(autoCloseDelay);
  const { dialogRef, mounted } = useDialogAccessibility({ open, onClose: onCancel });
  const titleId = useId();
  const descriptionId = useId();

  const shouldShowProgress = open && autoClose && showProgress;

  const clearAutoCloseTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const runAutoCloseTimer = useCallback(() => {
    if (!open || !autoClose) {
      return;
    }

    startedAtRef.current = Date.now();
    timeoutRef.current = window.setTimeout(() => {
      onCancel();
    }, remainingMsRef.current);
  }, [open, autoClose, onCancel]);

  useEffect(() => {
    if (!open || !autoClose) {
      clearAutoCloseTimer();
      return;
    }

    remainingMsRef.current = autoCloseDelay;
    runAutoCloseTimer();

    return () => {
      clearAutoCloseTimer();
    };
  }, [open, autoClose, autoCloseDelay, clearAutoCloseTimer, runAutoCloseTimer]);

  function handleMouseEnter() {
    if (!open || !autoClose) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearAutoCloseTimer();
  }

  function handleMouseLeave() {
    if (!open || !autoClose || remainingMsRef.current <= 0) {
      return;
    }

    runAutoCloseTimer();
  }

  const progressStyle: CSSProperties | undefined = shouldShowProgress
    ? {
        animationDuration: `${autoCloseDelay}ms`,
      }
    : undefined;

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[140] flex transition-[visibility] duration-200",
        getWrapperPositionClass(position),
        open ? "pointer-events-auto visible" : "pointer-events-none invisible",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      ref={dialogRef}
      tabIndex={-1}
    >
      <button
        type="button"
        className={cn("absolute inset-0 bg-slate-900/75 dark:bg-slate-950/75", open ? "ui-overlay-enter" : "ui-overlay-exit")}
        onClick={onCancel}
        aria-label="Close dialog"
      />

      <div
        className={cn(
          "group relative z-10 border bg-white dark:bg-slate-900 p-5 shadow-xl",
          config.panelClassName,
          getPanelPositionClass(position),
          getPanelAnimationClass(position, open),
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ScrollArea className="pr-1" viewportClassName="max-h-[55vh]" fadeEdges hideScrollbarUntilHover>
          <div className="flex items-start gap-3">
            <div className={cn("mt-0.5 rounded-full p-2", fieldColorClasses[resolvedColor].soft)}>
              <Icon className={cn("h-5 w-5", fieldColorClasses[resolvedColor].text)} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
              {description ? (
                <p id={descriptionId} className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </ScrollArea>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant={color ? "primary" : config.confirmVariant} color={resolvedColor} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>

        {shouldShowProgress ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-xl bg-slate-100 dark:bg-slate-800">
            <div
              key={`confirm-progress-${open}-${autoCloseDelay}`}
              className={cn(
                "ui-progress-animate h-full [animation-play-state:running] group-hover:[animation-play-state:paused]",
                fieldColorClasses[resolvedColor].solid,
              )}
              style={progressStyle}
            />
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
