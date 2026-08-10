"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useMemo, useRef, useState } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export interface FilterOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FilterDropdownProps {
  label?: string;
  options: FilterOption[];
  selectedValues?: string[];
  onChange?: (values: string[]) => void;
  multiple?: boolean;
  color?: UIColor;
  className?: string;
}

export function FilterDropdown({
  label = "Filter",
  options,
  selectedValues = [],
  onChange,
  multiple = true,
  color = "slate",
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function toggleValue(value: string) {
    if (multiple) {
      if (selectedSet.has(value)) {
        onChange?.(selectedValues.filter((selected) => selected !== value));
        return;
      }

      onChange?.([...selectedValues, value]);
      return;
    }

    if (selectedSet.has(value)) {
      onChange?.([]);
      setOpen(false);
      return;
    }

    onChange?.([value]);
    setOpen(false);
  }

  function clearFilters() {
    onChange?.([]);
  }

  return (
    <div className={cn("relative", open && "z-[120]", className)} ref={containerRef}>
      <button
        type="button"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2",
          fieldColorClasses[color].focusVisible,
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{label}</span>
        {selectedValues.length > 0 ? (
          <span className={cn("rounded-full px-2 py-0.5 text-xs", fieldColorClasses[color].solid)}>
            {selectedValues.length}
          </span>
        ) : null}
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute right-0 top-11 z-[120] w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="max-h-64 overflow-y-auto">
          {options.length === 0 ? (
            <p className="rounded-md px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No filter option.</p>
          ) : (
            options.map((option) => {
              const selected = selectedSet.has(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                    selected ? cn("font-medium", fieldColorClasses[color].soft) : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/60",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selected ? <CheckIcon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:text-slate-200"
          >
            <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}
