import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

import { cn } from "@/ui/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumb({ items, className, showHomeIcon = true }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("overflow-x-auto", className)}>
      <ol className="flex min-w-max items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <ChevronRightIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" /> : null}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  {showHomeIcon && index === 0 ? <HomeIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-1",
                    isLast ? "font-medium text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300",
                  )}
                >
                  {showHomeIcon && index === 0 ? <HomeIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
