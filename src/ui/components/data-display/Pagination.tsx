"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import type { UIColor } from "@/ui/types/color";
import { buttonColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  color?: UIColor;
  className?: string;
}

type PageToken = number | "ellipsis";

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PageToken[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);

  return tokens;
}

export function Pagination({ currentPage, totalPages, onPageChange, color = "slate", className }: PaginationProps) {
  const safeTotal = Math.max(totalPages, 1);
  const safeCurrent = Math.min(Math.max(currentPage, 1), safeTotal);
  const pageTokens = buildPageTokens(safeCurrent, safeTotal);

  return (
    <nav
      className={cn("flex flex-wrap items-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
        disabled={safeCurrent === 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {pageTokens.map((token, index) => {
        if (token === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400 dark:text-slate-500" aria-hidden="true">
              ...
            </span>
          );
        }

        return (
          <button
            key={token}
            type="button"
            onClick={() => onPageChange(token)}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
              safeCurrent === token
                ? cn("border-transparent", buttonColorClasses[color].solid)
                : "border-slate-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
            )}
            aria-current={safeCurrent === token ? "page" : undefined}
          >
            {token}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(safeTotal, safeCurrent + 1))}
        disabled={safeCurrent === safeTotal}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
