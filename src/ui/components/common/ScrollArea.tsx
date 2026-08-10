"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/ui/utils/cn";

export interface ScrollAreaProps {
  children: ReactNode;
  orientation?: "vertical" | "horizontal" | "both";
  className?: string;
  viewportClassName?: string;
  fadeEdges?: boolean;
  hideScrollbarUntilHover?: boolean;
  fillContainer?: boolean;
}

interface ScrollEdgeState {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const INITIAL_EDGE_STATE: ScrollEdgeState = {
  top: false,
  right: false,
  bottom: false,
  left: false,
};

function getOverflowClass(orientation: ScrollAreaProps["orientation"]) {
  switch (orientation) {
    case "horizontal":
      return "overflow-x-auto overflow-y-hidden";
    case "both":
      return "overflow-auto";
    case "vertical":
    default:
      return "overflow-y-auto overflow-x-hidden";
  }
}

export function ScrollArea({
  children,
  orientation = "vertical",
  className,
  viewportClassName,
  fadeEdges = false,
  hideScrollbarUntilHover = false,
  fillContainer = false,
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState<ScrollEdgeState>(INITIAL_EDGE_STATE);

  const updateEdges = useCallback(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const maxVerticalScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    const maxHorizontalScroll = Math.max(0, element.scrollWidth - element.clientWidth);

    const nextState: ScrollEdgeState = {
      top: element.scrollTop > 1,
      bottom: maxVerticalScroll - element.scrollTop > 1,
      left: element.scrollLeft > 1,
      right: maxHorizontalScroll - element.scrollLeft > 1,
    };

    setEdges((previousState) => {
      if (
        previousState.top === nextState.top &&
        previousState.bottom === nextState.bottom &&
        previousState.left === nextState.left &&
        previousState.right === nextState.right
      ) {
        return previousState;
      }

      return nextState;
    });
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    let frameId = 0;

    const queueUpdate = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        updateEdges();
      });
    };

    queueUpdate();

    element.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    const resizeObserver = new ResizeObserver(queueUpdate);
    resizeObserver.observe(element);

    if (element.firstElementChild instanceof HTMLElement) {
      resizeObserver.observe(element.firstElementChild);
    }

    return () => {
      element.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      resizeObserver.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [updateEdges]);

  useEffect(() => {
    updateEdges();
  }, [children, orientation, updateEdges]);

  const showVerticalFades = fadeEdges && orientation !== "horizontal";
  const showHorizontalFades = fadeEdges && orientation !== "vertical";

  return (
    <div className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}>
      <div
        ref={viewportRef}
        className={cn(
          "ui-scroll-area min-h-0 min-w-0",
          fillContainer && "h-full w-full",
          getOverflowClass(orientation),
          viewportClassName,
          hideScrollbarUntilHover && "ui-scrollbar-hover",
        )}
      >
        {children}
      </div>

      {showVerticalFades ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent transition-opacity duration-200 dark:from-slate-900",
              edges.top ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 dark:from-slate-900",
              edges.bottom ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : null}

      {showHorizontalFades ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 dark:from-slate-900",
              edges.left ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 dark:from-slate-900",
              edges.right ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : null}
    </div>
  );
}
