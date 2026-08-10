import { forwardRef, type ButtonHTMLAttributes } from "react";

import type { UIColor } from "@/ui/types/color";
import { buttonColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: UIColor;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, (color: UIColor) => string> = {
  primary: (color) => buttonColorClasses[color].solid,
  secondary: (color) => buttonColorClasses[color].soft,
  outline: (color) => buttonColorClasses[color].outline,
  ghost: (color) => buttonColorClasses[color].ghost,
  danger: () => buttonColorClasses.rose.solid,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    color = "slate",
    isLoading = false,
    disabled,
    children,
    type,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,color,box-shadow,transform] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.99]",
        "dark:focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-70",
        variantClasses[variant](color),
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            className="opacity-30"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
});
