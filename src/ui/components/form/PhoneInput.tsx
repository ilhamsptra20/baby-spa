"use client";

import { PhoneIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type PhoneInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  color?: UIColor;
  className?: string;
};

function normalizePhoneValue(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  return `62${digits}`;
}

function formatIndonesianPhone(rawValue: string) {
  const normalized = normalizePhoneValue(rawValue);
  if (!normalized) {
    return "";
  }

  const local = normalized.slice(2);
  if (!local) {
    return "+62";
  }

  if (local.length <= 3) {
    return `+62 ${local}`;
  }

  if (local.length <= 7) {
    return `+62 ${local.slice(0, 3)}-${local.slice(3)}`;
  }

  if (local.length <= 11) {
    return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
  }

  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7, 11)}-${local.slice(11)}`;
}

export function PhoneInput({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  color = "slate",
  className,
}: PhoneInputProps) {
  const fieldId = id ?? name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;
  const normalizedValue = normalizePhoneValue(value);
  const displayValue = formatIndonesianPhone(value);

  function handleValueChange(nextInputValue: string) {
    const digits = nextInputValue.replace(/\D/g, "");

    if (!digits) {
      onChange?.("");
      return;
    }

    const nextRaw = digits.startsWith("62") ? digits : `62${digits}`;
    onChange?.(nextRaw);
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
        {name && !disabled ? <input type="hidden" name={name} value={normalizedValue} /> : null}
        <PhoneIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />

        <input
          id={fieldId}
          type="tel"
          value={displayValue}
          onChange={(event) => handleValueChange(event.target.value)}
          placeholder={placeholder ?? "+62 812-3456-7890"}
          disabled={disabled}
          required={required}
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-9 pr-10 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
            fieldColorClasses[color].focus,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        />

        {clearable && normalizedValue && !disabled ? (
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            aria-label="Clear phone number"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </FormField>
  );
}
