"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { forwardRef, type InputHTMLAttributes, useId } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

import { FormError } from "./FormError";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  error?: string;
  color?: UIColor;
  containerClassName?: string;
}

export interface RadioCheckProps extends RadioProps {
  description?: string;
}

export interface RadioOption {
  label: string;
  value: string;
  helperText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  color?: UIColor;
  className?: string;
  orientation?: "vertical" | "horizontal";
  variant?: "radio" | "check";
}

function createOptionId(prefix: string, value: string) {
  return `${prefix}-${value.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { id, name, label, helperText, error, color = "sky", disabled, className, containerClassName, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name ? `${name}-` : "radio-"}${generatedId}`;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "group flex min-h-10 cursor-pointer items-start gap-2.5 rounded-md border border-transparent px-2.5 py-2 transition",
          "hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900/70",
          fieldColorClasses[color].selectedSurface,
          error && "hover:border-rose-200 hover:bg-rose-50/60 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10",
          disabled && "cursor-not-allowed opacity-70",
        )}
      >
        <span className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            {...props}
            ref={ref}
            id={inputId}
            name={name}
            type="radio"
            disabled={disabled}
            className="peer sr-only"
            aria-describedby={error || helperText ? descriptionId : undefined}
          />
          <span
            className={cn(
              "flex h-[18px] w-[18px] items-center justify-center rounded-full border border-slate-300 bg-white shadow-xs transition duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-slate-950",
              fieldColorClasses[color].peerFocusVisible,
              "dark:border-slate-600 dark:bg-slate-950",
              fieldColorClasses[color].radioControl,
              "peer-checked:[&_.radio-dot]:scale-100 peer-checked:[&_.radio-dot]:opacity-100",
              error && "border-rose-400 peer-focus-visible:ring-rose-200 dark:border-rose-500",
              disabled && "bg-slate-100 dark:bg-slate-800",
              className,
            )}
            aria-hidden="true"
          >
            <span className={cn("radio-dot h-2 w-2 scale-50 rounded-full opacity-0 transition duration-150", fieldColorClasses[color].selectedDot)} />
          </span>
        </span>

        {(label || helperText || error) && (
          <span className="min-w-0 space-y-1">
            {label ? <span className="block text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">{label}</span> : null}
            {error ? (
              <FormError id={descriptionId} message={error} />
            ) : helperText ? (
              <span id={descriptionId} className="block text-sm leading-5 text-slate-500 dark:text-slate-400">
                {helperText}
              </span>
            ) : null}
          </span>
        )}
      </label>
    </div>
  );
});

export const RadioCheck = forwardRef<HTMLInputElement, RadioCheckProps>(function RadioCheck(
  {
    id,
    name,
    label,
    description,
    helperText,
    error,
    color = "sky",
    disabled,
    className,
    containerClassName,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name ? `${name}-check-` : "radio-check-"}${generatedId}`;
  const descriptionId = `${inputId}-description`;
  const resolvedDescription = description ?? helperText;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "group flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-xs transition dark:border-slate-700 dark:bg-slate-900",
          "hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/70",
          fieldColorClasses[color].selectedSurface,
          error && "border-rose-300 hover:border-rose-400 dark:border-rose-500/60",
          disabled && "cursor-not-allowed opacity-70",
          className,
        )}
      >
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            {...props}
            ref={ref}
            id={inputId}
            name={name}
            type="radio"
            disabled={disabled}
            className="peer sr-only"
            aria-describedby={error || resolvedDescription ? descriptionId : undefined}
          />
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-white shadow-xs transition duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-950 dark:peer-focus-visible:ring-offset-slate-950",
              fieldColorClasses[color].peerFocusVisible,
              fieldColorClasses[color].selectedControl,
              "peer-checked:[&_.radio-check-icon]:scale-100 peer-checked:[&_.radio-check-icon]:opacity-100",
              error && "border-rose-400 peer-focus-visible:ring-rose-200 dark:border-rose-500",
              disabled && "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-500",
            )}
            aria-hidden="true"
          >
            <CheckIcon className="radio-check-icon h-3.5 w-3.5 scale-75 opacity-0 transition duration-150" />
          </span>
        </span>

        {(label || resolvedDescription || error) && (
          <span className="min-w-0 space-y-1">
            {label ? <span className="block text-sm font-medium leading-5 text-slate-800 dark:text-slate-100">{label}</span> : null}
            {error ? (
              <FormError id={descriptionId} message={error} />
            ) : resolvedDescription ? (
              <span id={descriptionId} className="block text-sm leading-5 text-slate-500 dark:text-slate-400">
                {resolvedDescription}
              </span>
            ) : null}
          </span>
        )}
      </label>
    </div>
  );
});

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  helperText,
  error,
  disabled = false,
  color = "sky",
  className,
  orientation = "vertical",
  variant = "radio",
}: RadioGroupProps) {
  const groupId = useId();
  const descriptionId = `${groupId}-description`;
  const optionIdPrefix = createOptionId(name || "radio-group", groupId);
  const OptionComponent = variant === "check" ? RadioCheck : Radio;

  return (
    <fieldset className={cn("space-y-2", className)}>
      {label ? <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</legend> : null}

      <div
        className={cn(
          "gap-2",
          orientation === "vertical" ? "grid" : "flex flex-wrap items-start gap-2",
        )}
      >
        {options.map((option) => (
          <OptionComponent
            id={createOptionId(optionIdPrefix, option.value)}
            key={option.value}
            name={name}
            label={option.label}
            value={option.value}
            checked={value === option.value}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                onChange?.(option.value);
              }
            }}
            helperText={option.helperText}
            disabled={disabled || option.disabled}
            color={color}
          />
        ))}
      </div>

      {error ? (
        <FormError id={descriptionId} message={error} />
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </fieldset>
  );
}
