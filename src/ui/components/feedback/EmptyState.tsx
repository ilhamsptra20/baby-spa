import { InboxIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";

import { cn } from "@/ui/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/60 px-6 py-10 text-center transition-colors duration-200",
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm">
        {icon ?? <InboxIcon className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
