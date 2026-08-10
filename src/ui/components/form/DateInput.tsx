"use client";

import {
  CalendarDaysIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";
import { formatDateDisplay } from "@/ui/utils/date";

import { Calendar } from "./Calendar";

export type DateInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
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

export function DateInput({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder = "Pilih tanggal",
  min,
  max,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  color = "slate",
  className,
}: DateInputProps) {
  const fieldId = id ?? name ?? "date-input";
  const listId = `${fieldId}-calendar`;
  const hasValue = value.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const rightPaddingClass = showClear ? "pr-16" : "pr-10";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      {name && !disabled ? <input type="hidden" name={name} value={value} /> : null}
      <div ref={containerRef} className={cn("relative", open && "z-[120]")}>
        <button
          id={fieldId}
          type="button"
          onClick={() => {
            if (disabled) {
              return;
            }

            setOpen((previous) => !previous);
          }}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={listId}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-3 text-left text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200",
            "focus-visible:ring-2",
            fieldColorClasses[color].focusVisible,
            disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-100",
            className,
          )}
        >
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />

          <span className={cn("min-w-0 flex-1 truncate", !hasValue && "text-slate-400 dark:text-slate-500")}>
            {hasValue ? formatDateDisplay(value) : placeholder}
          </span>

        </button>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="pointer-events-auto rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear date"
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
          id={listId}
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top transition-all duration-200",
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0",
          )}
        >
          <Calendar
            value={value}
            onChange={(nextValue) => {
              onChange?.(nextValue);
              setOpen(false);
            }}
            min={min}
            max={max}
            onEscape={() => setOpen(false)}
            color={color}
            className="w-full"
          />
        </div>
      </div>
    </FormField>
  );
}
