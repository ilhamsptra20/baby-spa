import { type TextareaHTMLAttributes } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  errorMessage?: string;
  color?: UIColor;
  containerClassName?: string;
}

export function Textarea({
  className,
  containerClassName,
  label,
  helperText,
  error,
  errorMessage,
  color = "slate",
  id,
  name,
  disabled,
  ...props
}: TextareaProps) {
  const textareaId = id ?? name;
  const descriptionId = textareaId ? `${textareaId}-description` : undefined;
  const resolvedError = error ?? errorMessage;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label ? (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        name={name}
        disabled={disabled}
        className={cn(
          "min-h-28 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
          fieldColorClasses[color].focus,
          resolvedError && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
          className,
        )}
        aria-invalid={Boolean(resolvedError)}
        aria-describedby={descriptionId}
        {...props}
      />
      {resolvedError ? (
        <p id={descriptionId} className="text-sm text-rose-600">
          {resolvedError}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
