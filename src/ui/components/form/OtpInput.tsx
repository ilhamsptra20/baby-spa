"use client";

import { KeyIcon } from "@heroicons/react/24/outline";
import { type ChangeEvent, type KeyboardEvent, useMemo, useRef } from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type OtpInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  length?: number;
  numericOnly?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  color?: UIColor;
  className?: string;
};

function sanitizeOtp(value: string, numericOnly: boolean) {
  return numericOnly ? value.replace(/\D/g, "") : value.replace(/\s/g, "");
}

export function OtpInput({
  id,
  name,
  label,
  value = "",
  onChange,
  length = 6,
  numericOnly = true,
  helperText,
  error,
  disabled = false,
  required = false,
  color = "slate",
  className,
}: OtpInputProps) {
  const fieldId = id ?? name ?? "otp-input";
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const normalizedValue = useMemo(
    () => sanitizeOtp(value, numericOnly).slice(0, Math.max(1, length)),
    [value, numericOnly, length],
  );

  const slots = Array.from({ length: Math.max(1, length) }, (_, index) => normalizedValue[index] ?? "");

  function updateValueAt(index: number, nextChar: string) {
    const current = slots.join("").split("");
    current[index] = nextChar;

    const nextValue = current.join("").slice(0, length);
    onChange?.(nextValue);
  }

  function focusIndex(index: number) {
    refs.current[index]?.focus();
    refs.current[index]?.select();
  }

  function handleInputChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeOtp(event.target.value, numericOnly);

    if (!sanitized) {
      updateValueAt(index, "");
      return;
    }

    const nextChars = sanitized.slice(0, length - index).split("");
    const current = slots.join("").split("");

    for (let offset = 0; offset < nextChars.length; offset += 1) {
      current[index + offset] = nextChars[offset] ?? "";
    }

    const nextValue = current.join("").slice(0, length);
    onChange?.(nextValue);

    const nextFocusIndex = Math.min(index + nextChars.length, length - 1);
    focusIndex(nextFocusIndex);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (slots[index]) {
        updateValueAt(index, "");
        return;
      }

      if (index > 0) {
        updateValueAt(index - 1, "");
        focusIndex(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();

    const pasted = sanitizeOtp(event.clipboardData.getData("text"), numericOnly).slice(0, length);
    if (!pasted) {
      return;
    }

    onChange?.(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  }

  return (
    <FormField label={label} helperText={helperText} error={error} required={required}>
      <div className={cn("space-y-2", className)}>
        {name && !disabled ? <input type="hidden" name={name} value={normalizedValue} /> : null}
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <KeyIcon className="h-4 w-4" aria-hidden="true" />
          One-time code
        </div>

        <div className="flex flex-wrap items-center gap-2" onPaste={handlePaste}>
          {slots.map((char, index) => (
            <input
              key={`${fieldId}-${index}`}
              ref={(element) => {
                refs.current[index] = element;
              }}
              value={char}
              onChange={(event) => handleInputChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputMode={numericOnly ? "numeric" : "text"}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              disabled={disabled}
              required={required}
              maxLength={length}
              aria-label={`OTP digit ${index + 1}`}
              className={cn(
                "h-11 w-11 rounded-md border border-slate-300 bg-white dark:bg-slate-900 text-center text-base font-semibold text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
                fieldColorClasses[color].focus,
                error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
              )}
            />
          ))}
        </div>
      </div>
    </FormField>
  );
}
