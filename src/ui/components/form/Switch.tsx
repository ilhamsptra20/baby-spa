"use client";

import { type ButtonHTMLAttributes, useId } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

import { FormError } from "./FormError";

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  color?: UIColor;
  containerClassName?: string;
}

export function Switch({
  id,
  name,
  checked = false,
  onChange,
  onCheckedChange,
  label,
  helperText,
  error,
  disabled = false,
  loading = false,
  color = "slate",
  className,
  containerClassName,
  ...props
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? `switch-${generatedId}`;
  const descriptionId = `${switchId}-description`;

  function handleToggle() {
    if (disabled || loading) {
      return;
    }

    const nextChecked = !checked;

    onChange?.(nextChecked);
    onCheckedChange?.(nextChecked);
  }

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {name && !disabled ? <input type="hidden" name={name} value={checked ? "true" : "false"} /> : null}
      <div className="flex items-start justify-between gap-3">
        {(label || helperText || error) && (
          <div className="space-y-1">
            {label ? (
              <label htmlFor={switchId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                {label}
              </label>
            ) : null}
            {error ? (
              <FormError id={descriptionId} message={error} />
            ) : helperText ? (
              <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
                {helperText}
              </p>
            ) : null}
          </div>
        )}

        <button
          {...props}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? descriptionId : undefined}
          aria-disabled={disabled || loading}
          disabled={disabled || loading}
          onClick={handleToggle}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            fieldColorClasses[color].focusVisible,
            checked ? cn("border-transparent", fieldColorClasses[color].solid) : "border-slate-300 bg-slate-200",
            disabled && "cursor-not-allowed opacity-60",
            error && "border-rose-400 focus-visible:ring-rose-200",
            className,
          )}
        >
          <span
            className={cn(
              "inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 shadow-sm transition-transform duration-200",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          >
            {loading ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-300" /> : null}
          </span>
        </button>
      </div>
    </div>
  );
}
