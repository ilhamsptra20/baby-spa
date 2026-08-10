import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";

import { Button } from "@/ui/components/common/Button";
import { cn } from "@/ui/utils/cn";

interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function NotFoundState({
  title = "Data not found",
  description = "The requested resource could not be found.",
  actionLabel,
  onAction,
  icon,
  className,
}: NotFoundStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/60 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm">
        {icon ?? <DocumentMagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />}
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">{description}</p>

      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
