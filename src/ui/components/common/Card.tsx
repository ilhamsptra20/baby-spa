import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/ui/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  contentClassName?: string;
}

export function Card({
  className,
  title,
  description,
  headerAction,
  contentClassName,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow",
        "dark:border-slate-800 dark:bg-slate-900 dark:shadow-none",
        className,
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            {title ? <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </header>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
