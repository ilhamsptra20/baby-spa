"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { ScrollArea } from "@/ui/components/common";
import { useDialogAccessibility } from "@/ui/hooks";
import { cn } from "@/ui/utils/cn";

export type ModalPosition = "center" | "top" | "bottom" | "left" | "right";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  position?: ModalPosition;
  autoClose?: boolean;
  autoCloseDelay?: number;
  showProgress?: boolean;
  onClose: () => void;
}

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
      return "w-full max-w-lg rounded-xl";
  }
}

function getPanelAnimationClass(position: ModalPosition, open: boolean) {
  if (open) {
    return `ui-modal-enter-${position}`;
  }

  return `ui-modal-exit-${position}`;
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  className,
  position = "center",
  autoClose = false,
  autoCloseDelay = 3000,
  showProgress = false,
  onClose,
}: ModalProps) {
  const timeoutRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const remainingMsRef = useRef(autoCloseDelay);
  const { dialogRef, mounted } = useDialogAccessibility({ open, onClose });
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
      onClose();
    }, remainingMsRef.current);
  }, [open, autoClose, onClose]);

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
  }, [open, autoClose, autoCloseDelay, runAutoCloseTimer, clearAutoCloseTimer]);

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

  const bodyHeightClassName =
    position === "left" || position === "right"
      ? footer
        ? "h-[calc(100%-132px)]"
        : "h-[calc(100%-72px)]"
      : "max-h-[70vh]";

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
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className={cn(
          "group relative z-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl",
          getPanelPositionClass(position),
          getPanelAnimationClass(position, open),
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 transition duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ScrollArea
          className="px-5 py-4"
          viewportClassName={bodyHeightClassName}
          fadeEdges
          hideScrollbarUntilHover
        >
          {children}
        </ScrollArea>

        {footer ? <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4">{footer}</div> : null}

        {shouldShowProgress ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-xl bg-slate-100 dark:bg-slate-800">
            <div
              key={`modal-progress-${open}-${autoCloseDelay}`}
              className="ui-progress-animate h-full bg-slate-700 [animation-play-state:running] group-hover:[animation-play-state:paused]"
              style={progressStyle}
            />
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
