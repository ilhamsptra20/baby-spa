"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type PasswordStrength = "weak" | "medium" | "strong";

export type PasswordInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showStrength?: boolean;
  color?: UIColor;
  className?: string;
};

function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const score = [hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;

  if (password.length >= 10 && score >= 3) {
    return "strong";
  }

  if (password.length >= 6 && score >= 2) {
    return "medium";
  }

  return "weak";
}

export function PasswordInput({
  id,
  name,
  label,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  helperText,
  error,
  disabled = false,
  required = false,
  showStrength = true,
  color = "slate",
  className,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value ?? "" : uncontrolledValue;
  const fieldId = id ?? name;
  const descriptionId = fieldId ? `${fieldId}-description` : undefined;

  const strength = useMemo(() => evaluatePasswordStrength(resolvedValue), [resolvedValue]);

  const strengthStyles: Record<PasswordStrength, string> = {
    weak: "bg-rose-500",
    medium: "bg-amber-500",
    strong: "bg-emerald-500",
  };

  const strengthLabel: Record<PasswordStrength, string> = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  function handleValueChange(nextValue: string) {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }

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
      <div className="space-y-2">
        <div className="relative">
          <input
            id={fieldId}
            name={name}
            type={visible ? "text" : "password"}
            value={resolvedValue}
            onChange={(event) => handleValueChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={descriptionId}
            className={cn(
              "h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-3 pr-10 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
              fieldColorClasses[color].focus,
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
              className,
            )}
          />

          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              type="button"
              onClick={() => setVisible((prev) => !prev)}
              disabled={disabled}
              className="rounded p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
                <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {showStrength && resolvedValue ? (
          <div className="space-y-1" aria-live="polite">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={cn("h-full rounded-full transition-all", strengthStyles[strength])}
                style={{ width: strength === "weak" ? "34%" : strength === "medium" ? "67%" : "100%" }}
              />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Password strength: {strengthLabel[strength]}</p>
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
