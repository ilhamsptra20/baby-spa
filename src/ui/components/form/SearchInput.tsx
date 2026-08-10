"use client";

import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type SearchInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  loading?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  color?: UIColor;
  className?: string;
};

export function SearchInput({
  id,
  name,
  label,
  value = "",
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "Cari...",
  loading = false,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = true,
  color = "slate",
  className,
}: SearchInputProps) {
  const fieldId = id ?? name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  const showClear = clearable && value.length > 0 && !disabled;
  const rightIconCount = (loading ? 1 : 0) + (showClear ? 1 : 0);
  const rightPaddingClass = rightIconCount >= 2 ? "pr-16" : rightIconCount === 1 ? "pr-10" : "pr-3";

  useEffect(() => {
    if (!onDebouncedChange) {
      return;
    }

    const timer = window.setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [debounceMs, onDebouncedChange, value]);

  function handleInputChange(nextValue: string) {
    onChange?.(nextValue);
  }

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />

        <input
          id={fieldId}
          name={name}
          type="text"
          role="searchbox"
          value={value}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-9 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            fieldColorClasses[color].focus,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}

          {showClear ? (
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear search"
              disabled={disabled}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}
