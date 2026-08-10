"use client";

import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import {
  forwardRef,
  type InputHTMLAttributes,
  type Ref,
  useEffect,
  useId,
  useRef,
} from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

import { FormError } from "./FormError";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  error?: string;
  indeterminate?: boolean;
  color?: UIColor;
  containerClassName?: string;
}

function setRefValue<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  ref.current = value;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    id,
    name,
    label,
    helperText,
    error,
    indeterminate = false,
    color = "sky",
    disabled,
    className,
    containerClassName,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? `${name ? `${name}-` : "checkbox-"}${generatedId}`;
  const descriptionId = `${inputId}-description`;
  const localRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (localRef.current) {
      localRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

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
            id={inputId}
            name={name}
            ref={(node) => {
              localRef.current = node;
              setRefValue(ref, node);
            }}
            type="checkbox"
            disabled={disabled}
            className="peer sr-only"
            aria-invalid={Boolean(error)}
            aria-describedby={error || helperText ? descriptionId : undefined}
          />
          <span
            className={cn(
              "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-slate-300 bg-white text-white shadow-xs transition duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-slate-950",
              fieldColorClasses[color].peerFocusVisible,
              fieldColorClasses[color].selectedControl,
              "dark:border-slate-600 dark:bg-slate-950",
              "peer-checked:[&_.checkbox-check]:scale-100 peer-checked:[&_.checkbox-check]:opacity-100",
              "peer-indeterminate:[&_.checkbox-check]:scale-75 peer-indeterminate:[&_.checkbox-check]:opacity-0 peer-indeterminate:[&_.checkbox-minus]:scale-100 peer-indeterminate:[&_.checkbox-minus]:opacity-100",
              error && "border-rose-400 peer-focus-visible:ring-rose-200 dark:border-rose-500",
              disabled && "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-500",
              className,
            )}
            aria-hidden="true"
          >
            <CheckIcon className="checkbox-check h-3 w-3 scale-75 opacity-0 transition duration-150" />
            <MinusIcon className="checkbox-minus absolute h-3 w-3 scale-75 opacity-0 transition duration-150" />
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
