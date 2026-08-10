import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";

import { Button } from "@/ui/components/common/Button";
import { cn } from "@/ui/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error happened while loading this section.",
  onRetry,
  retryLabel = "Try again",
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-rose-200 bg-rose-50 px-6 py-8 text-center",
        className,
      )}
      role="alert"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-rose-600 shadow-sm">
        {icon ?? <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />}
      </div>

      <h3 className="mt-4 text-base font-semibold text-rose-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm text-rose-700">{description}</p>

      {onRetry ? (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
