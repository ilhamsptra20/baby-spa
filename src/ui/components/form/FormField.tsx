import { type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/ui/utils/cn";

import { FormError } from "./FormError";
import { FormLabel } from "./FormLabel";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  optionalText?: string;
  labelClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
  controlClassName?: string;
  children: ReactNode;
}

export function FormField({
  className,
  label,
  htmlFor,
  helperText,
  error,
  required = false,
  optionalText,
  labelClassName,
  helperClassName,
  errorClassName,
  controlClassName,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label ? (
        <FormLabel htmlFor={htmlFor} required={required} optionalText={optionalText} className={labelClassName}>
          {label}
        </FormLabel>
      ) : null}

      <div className={cn(controlClassName)}>{children}</div>

      {error ? (
        <FormError message={error} className={errorClassName} />
      ) : helperText ? (
        <p className={cn("text-sm text-slate-500 dark:text-slate-400", helperClassName)}>{helperText}</p>
      ) : null}
    </div>
  );
}
