"use client";

import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { type ReactNode } from "react";

import { Button } from "@/ui/components/common/Button";
import { cn } from "@/ui/utils/cn";

interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
  filterLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function TableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onFilterClick,
  filterLabel = "Filter",
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-sm">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <Button
          type="button"
          variant="outline"
          className="sm:self-stretch"
          onClick={onFilterClick}
        >
          <FunnelIcon className="h-4 w-4" aria-hidden="true" />
          {filterLabel}
        </Button>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
