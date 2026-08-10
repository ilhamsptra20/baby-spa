"use client";

import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type KeyboardEvent } from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type NumberInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  showControls?: boolean;
  color?: UIColor;
  className?: string;
};

function normalizeValue(value: string | number | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function sanitizeValue(inputValue: string, allowNegative: boolean) {
  const cleaned = inputValue.replace(/[^\d.-]/g, "");
  const firstDot = cleaned.indexOf(".");
  const firstMinus = cleaned.indexOf("-");

  let result = cleaned;

  if (firstDot !== -1) {
    result = `${result.slice(0, firstDot + 1)}${result.slice(firstDot + 1).replace(/\./g, "")}`;
  }

  if (allowNegative) {
    if (firstMinus > 0) {
      result = result.replace(/-/g, "");
    } else {
      result = `${result.startsWith("-") ? "-" : ""}${result.replace(/-/g, "")}`;
    }
  } else {
    result = result.replace(/-/g, "");
  }

  return result;
}

export function NumberInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step = 1,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  showControls = true,
  color = "slate",
  className,
}: NumberInputProps) {
  const fieldId = id ?? name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  const resolvedValue = normalizeValue(value);
  const hasValue = resolvedValue.length > 0;
  const allowNegative = min === undefined || min < 0;
  const showClearAction = clearable && hasValue && !disabled;
  const rightPaddingClass = showControls
    ? showClearAction
      ? "pr-24"
      : "pr-20"
    : showClearAction
      ? "pr-10"
      : "pr-3";

  function clampValue(nextValue: number) {
    if (min !== undefined && nextValue < min) {
      return min;
    }

    if (max !== undefined && nextValue > max) {
      return max;
    }

    return nextValue;
  }

  function emitWithStep(direction: "increment" | "decrement") {
    const current = Number(resolvedValue || 0);
    const safeCurrent = Number.isNaN(current) ? 0 : current;
    const delta = direction === "increment" ? step : -step;
    const next = clampValue(safeCurrent + delta);
    onChange?.(String(next));
  }

  function handleChange(nextInput: string) {
    const sanitized = sanitizeValue(nextInput, allowNegative);

    if (!sanitized || sanitized === "-" || sanitized === "." || sanitized === "-.") {
      onChange?.(sanitized);
      return;
    }

    const numericValue = Number(sanitized);

    if (Number.isNaN(numericValue)) {
      return;
    }

    if (min !== undefined && numericValue < min) {
      return;
    }

    if (max !== undefined && numericValue > max) {
      return;
    }

    onChange?.(sanitized);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["e", "E", "+"].includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (!allowNegative && event.key === "-") {
      event.preventDefault();
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
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          type="text"
          value={resolvedValue}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          inputMode="decimal"
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            fieldColorClasses[color].focus,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-1">
          {showClearAction ? (
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="rounded p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear number"
              disabled={disabled}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {showControls ? (
            <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-0.5">
              <button
                type="button"
                onClick={() => emitWithStep("decrement")}
                disabled={disabled}
                className="rounded p-1 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrement"
              >
                <MinusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => emitWithStep("increment")}
                disabled={disabled}
                className="rounded p-1 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increment"
              >
                <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}
