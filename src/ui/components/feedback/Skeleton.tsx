import { type CSSProperties, type HTMLAttributes } from "react";

import { cn } from "@/ui/utils/cn";

type Rounded = "none" | "sm" | "md" | "lg" | "full";

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  width?: number | string;
  height?: number | string;
  rounded?: Rounded;
  style?: CSSProperties;
}

const roundedClass: Record<Rounded, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  className,
  width,
  height,
  rounded = "md",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-200",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[ui-skeleton-shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent",
        roundedClass[rounded],
        className,
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
