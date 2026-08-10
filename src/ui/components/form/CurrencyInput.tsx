"use client";

import { BanknotesIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type CurrencyInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  prefix?: string;
  align?: "left" | "right";
  placeholder?: string;
  allowDecimal?: boolean;
  decimalScale?: number;
  min?: number;
  max?: number;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  color?: UIColor;
  className?: string;
};

function formatIntegerPart(value: string) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/^0+(?=\d)/, "");
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function toDisplayValue(rawValue: string, allowDecimal: boolean) {
  if (!rawValue) {
    return "";
  }

  const normalized = rawValue.replace(/,/g, ".");
  const [integerPart, decimalPart] = normalized.split(".");
  const formattedInteger = formatIntegerPart(integerPart);

  const withDecimal =
    allowDecimal && decimalPart !== undefined
      ? `${formattedInteger},${decimalPart}`
      : formattedInteger;

  return withDecimal;
}

function sanitizeRawValue(nextValue: string, allowDecimal: boolean, decimalScale: number) {
  const stripped = nextValue.replace(/[^\d.,]/g, "");

  if (!allowDecimal || decimalScale <= 0) {
    return stripped.replace(/\D/g, "");
  }

  const commaIndex = stripped.lastIndexOf(",");
  const dotMatches = stripped.match(/\./g) ?? [];
  const dotIndex = stripped.lastIndexOf(".");
  const dotDecimalPartLength = dotIndex >= 0 ? stripped.slice(dotIndex + 1).length : 0;
  const dotLooksDecimal =
    dotMatches.length === 1 &&
    dotDecimalPartLength > 0 &&
    dotDecimalPartLength <= decimalScale &&
    dotDecimalPartLength !== 3;
  const decimalSeparatorIndex =
    commaIndex >= 0 ? commaIndex : dotLooksDecimal ? dotIndex : -1;

  if (decimalSeparatorIndex === -1) {
    return stripped.replace(/\D/g, "");
  }

  const integerPart = stripped.slice(0, decimalSeparatorIndex).replace(/\D/g, "");
  const decimalPartRaw = stripped.slice(decimalSeparatorIndex + 1).replace(/\D/g, "");
  const decimalPart = decimalPartRaw.slice(0, Math.max(0, decimalScale));

  if (!decimalPart && /[.,]$/.test(stripped)) {
    return `${integerPart}.`;
  }

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

function toComparableNumber(rawValue: string) {
  if (!rawValue) {
    return Number.NaN;
  }

  const normalized = rawValue.replace(/,/g, ".");

  if (normalized.endsWith(".")) {
    return Number(normalized.slice(0, -1));
  }

  return Number(normalized);
}

export function CurrencyInput({
  id,
  name,
  label,
  value = "",
  onChange,
  prefix = "Rp",
  align = "right",
  placeholder,
  allowDecimal = false,
  decimalScale = 2,
  min,
  max,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  color = "slate",
  className,
}: CurrencyInputProps) {
  const fieldId = id ?? name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  const displayValue = toDisplayValue(value, allowDecimal);
  const hasValue = value.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const resolvedPlaceholder = placeholder ?? "0";
  const hasPrefix = prefix.trim().length > 0;
  const inputLeftPaddingClass = hasPrefix ? "pl-20" : "pl-9";

  function emitValue(nextRawValue: string) {
    const comparable = toComparableNumber(nextRawValue);

    if (!Number.isNaN(comparable)) {
      if (min !== undefined && comparable < min) {
        return;
      }

      if (max !== undefined && comparable > max) {
        return;
      }
    }

    onChange?.(nextRawValue);
  }

  function handleInputChange(nextInputValue: string) {
    const nextRawValue = sanitizeRawValue(nextInputValue, allowDecimal, decimalScale);
    emitValue(nextRawValue);
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
        {name && !disabled ? <input type="hidden" name={name} value={value} /> : null}
        <BanknotesIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
        {hasPrefix ? (
          <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {prefix}
          </span>
        ) : null}

        <input
          id={fieldId}
          type="text"
          value={displayValue}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          required={required}
          inputMode={allowDecimal ? "decimal" : "numeric"}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white text-sm text-slate-900 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:text-slate-400",
            inputLeftPaddingClass,
            showClear ? "pr-10" : "pr-3",
            align === "right" ? "text-right" : "text-left",
            fieldColorClasses[color].focus,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        />

        {showClear ? (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              type="button"
              onClick={() => onChange?.("")}
              className="rounded p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear nominal"
              disabled={disabled}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
