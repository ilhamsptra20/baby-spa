import { forwardRef, type LabelHTMLAttributes } from "react";

import { cn } from "@/ui/utils/cn";

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optionalText?: string;
}

export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { className, children, required = false, optionalText, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn("inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-200", className)}
      {...props}
    >
      <span>{children}</span>
      {required ? <span className="text-rose-600">*</span> : null}
      {!required && optionalText ? <span className="text-xs text-slate-400 dark:text-slate-500">{optionalText}</span> : null}
    </label>
  );
});
