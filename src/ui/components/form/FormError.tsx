import { type HTMLAttributes } from "react";

import { cn } from "@/ui/utils/cn";

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  message?: string;
}

export function FormError({ className, message, children, ...props }: FormErrorProps) {
  if (!message && !children) {
    return null;
  }

  return (
    <p
      className={cn("text-sm text-rose-600", className)}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {message ?? children}
    </p>
  );
}
