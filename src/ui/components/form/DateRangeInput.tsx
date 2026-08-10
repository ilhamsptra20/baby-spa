"use client";

import {
  CalendarDaysIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";
import { compareDateString, formatDateDisplay } from "@/ui/utils/date";

import { Calendar } from "./Calendar";

export type DateRangeValue = {
  start?: string;
  end?: string;
};

export type DateRangeInputProps = {
  id?: string;
  name?: string;
  startName?: string;
  endName?: string;
  label?: string;
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  color?: UIColor;
  className?: string;
};

export function DateRangeInput({
  id,
  name,
  startName,
  endName,
  label,
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  min,
  max,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  color = "slate",
  className,
}: DateRangeInputProps) {
  const fieldId = id ?? name ?? startName ?? "date-range";
  const panelId = `${fieldId}-calendar`;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const start = value?.start ?? "";
  const end = value?.end ?? "";

  const hasValue = Boolean(start || end);
  const showClear = clearable && hasValue && !disabled;
  const rightPaddingClass = showClear ? "pr-16" : "pr-10";
  const hasCompleteRange = Boolean(start && end);

  const internalError =
    start && end && compareDateString(end, start) === -1
      ? "Tanggal akhir tidak boleh lebih kecil dari tanggal mulai."
      : undefined;
  const resolvedError = error ?? internalError;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const displayValue = hasCompleteRange
    ? `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`
    : start
      ? `${formatDateDisplay(start)} - ...`
      : placeholder;

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={resolvedError}
      required={required}
    >
      {!disabled && name ? (
        <input type="hidden" name={name} value={JSON.stringify({ start, end })} />
      ) : null}
      {!disabled && startName ? <input type="hidden" name={startName} value={start} /> : null}
      {!disabled && endName ? <input type="hidden" name={endName} value={end} /> : null}
      <div ref={containerRef} className={cn("relative", open && "z-[120]")}>
        <button
          id={fieldId}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return;
            }

            setOpen((previous) => !previous);
          }}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-3 text-left text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200",
            "focus-visible:ring-2",
            fieldColorClasses[color].focusVisible,
            disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            resolvedError &&
              "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-100",
            className,
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
        >
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />

          <span className={cn("min-w-0 flex-1 truncate", !hasValue && "text-slate-400 dark:text-slate-500")}>
            {displayValue}
          </span>

        </button>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onChange?.({ start: "", end: "" });
                setOpen(false);
              }}
              className="pointer-events-auto rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear range"
              disabled={disabled}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </div>

        <div
          id={panelId}
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top transition-all duration-200",
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-lg">
            <Calendar
              range
              value={{ start, end }}
              onChange={(nextValue) => {
                const nextStart = nextValue.start ?? "";
                const nextEnd = nextValue.end ?? "";

                onChange?.({ start: nextStart, end: nextEnd });

                if (nextStart && nextEnd) {
                  setOpen(false);
                }
              }}
              min={min}
              max={max}
              onEscape={() => setOpen(false)}
              color={color}
              className="w-full max-w-none border-slate-200 dark:border-slate-700 p-2 shadow-none"
            />
          </div>
        </div>
      </div>
    </FormField>
  );
}
