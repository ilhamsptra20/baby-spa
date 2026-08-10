import { type ReactNode } from "react";

import { cn } from "@/ui/utils/cn";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageTitle({ title, description, actions, className }: PageTitleProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
