"use client";

import {
  ChevronDownIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { buttonColorClasses, fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";
import { formatTimeString, parseTimeString } from "@/ui/utils/date";

export type TimeInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  step?: number;
  minuteStep?: number;
  min?: string;
  max?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  color?: UIColor;
  className?: string;
};

function timeToMinutes(value?: string): number | null {
  const parsed = parseTimeString(value);

  if (!parsed) {
    return null;
  }

  return parsed.hours * 60 + parsed.minutes;
}

function getDefaultMinuteStep(step?: number, minuteStep?: number) {
  if (typeof minuteStep === "number" && minuteStep > 0) {
    return Math.max(1, Math.min(30, Math.floor(minuteStep)));
  }

  if (typeof step === "number" && step > 0) {
    return Math.max(1, Math.min(30, Math.floor(step / 60)));
  }

  return 5;
}

export function TimeInput({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder = "Pilih waktu",
  step,
  minuteStep,
  min,
  max,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  color = "slate",
  className,
}: TimeInputProps) {
  const fieldId = id ?? name ?? "time-input";
  const listId = `${fieldId}-time-panel`;
  const hasValue = value.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const rightPaddingClass = showClear ? "pr-16" : "pr-10";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resolvedMinuteStep = getDefaultMinuteStep(step, minuteStep);

  const minuteOptions = useMemo(() => {
    const values: number[] = [];

    for (let minute = 0; minute < 60; minute += resolvedMinuteStep) {
      values.push(minute);
    }

    return values;
  }, [resolvedMinuteStep]);

  const parsedValue = parseTimeString(value);
  const [selectedHourState, setSelectedHourState] = useState<number>(0);
  const selectedHour = parsedValue?.hours ?? selectedHourState;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function isAllowedTime(nextValue: string) {
    const timeInMinutes = timeToMinutes(nextValue);

    if (timeInMinutes === null) {
      return false;
    }

    const minInMinutes = timeToMinutes(min);
    const maxInMinutes = timeToMinutes(max);

    if (minInMinutes !== null && timeInMinutes < minInMinutes) {
      return false;
    }

    if (maxInMinutes !== null && timeInMinutes > maxInMinutes) {
      return false;
    }

    return true;
  }

  function findFirstAllowedMinute(hour: number): number | null {
    for (const minute of minuteOptions) {
      if (isAllowedTime(formatTimeString(hour, minute))) {
        return minute;
      }
    }

    return null;
  }

  function isHourDisabled(hour: number) {
    return findFirstAllowedMinute(hour) === null;
  }

  function isMinuteDisabled(minute: number) {
    return !isAllowedTime(formatTimeString(selectedHour, minute));
  }

  function handleHourSelect(hour: number) {
    if (isHourDisabled(hour)) {
      return;
    }

    setSelectedHourState(hour);

    const existingMinute = parsedValue?.minutes;
    const nextMinute =
      typeof existingMinute === "number" && !isMinuteDisabled(existingMinute)
        ? existingMinute
        : findFirstAllowedMinute(hour);

    if (nextMinute === null) {
      return;
    }

    onChange?.(formatTimeString(hour, nextMinute));
  }

  function handleMinuteSelect(minute: number) {
    if (isMinuteDisabled(minute)) {
      return;
    }

    onChange?.(formatTimeString(selectedHour, minute));
    setOpen(false);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const displayValue = parsedValue
    ? formatTimeString(parsedValue.hours, parsedValue.minutes)
    : "";

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      {name && !disabled ? <input type="hidden" name={name} value={value} /> : null}
      <div ref={containerRef} className={cn("relative", open && "z-[120]")}>
        <button
          id={fieldId}
          type="button"
          onClick={() => {
            if (disabled) {
              return;
            }

            setOpen((previous) => !previous);
          }}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={listId}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-3 text-left text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200",
            "focus-visible:ring-2",
            fieldColorClasses[color].focusVisible,
            disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            error && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-100",
            className,
          )}
        >
          <ClockIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />

          <span className={cn("min-w-0 flex-1 truncate", !hasValue && "text-slate-400 dark:text-slate-500")}>
            {hasValue ? displayValue : placeholder}
          </span>

        </button>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="pointer-events-auto rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear time"
              disabled={disabled}
            >
              <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </div>

        <div
          id={listId}
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top transition-all duration-200",
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-lg">
            <div>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Jam
              </p>
              <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                {Array.from({ length: 24 }, (_, index) => index).map((hour) => {
                  const active = selectedHour === hour;
                  const disabledHour = isHourDisabled(hour);

                  return (
                    <li key={hour}>
                      <button
                        type="button"
                        disabled={disabledHour}
                        onClick={() => handleHourSelect(hour)}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-sm transition",
                          active
                            ? buttonColorClasses[color].solid
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                          disabledHour &&
                            "cursor-not-allowed opacity-40 hover:bg-transparent",
                        )}
                      >
                        {formatTimeString(hour, 0).slice(0, 2)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Menit
              </p>
              <ul className="max-h-48 space-y-0.5 overflow-y-auto">
                {minuteOptions.map((minute) => {
                  const active = parsedValue?.minutes === minute;
                  const disabledMinute = isMinuteDisabled(minute);

                  return (
                    <li key={minute}>
                      <button
                        type="button"
                        disabled={disabledMinute}
                        onClick={() => handleMinuteSelect(minute)}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-sm transition",
                          active
                            ? buttonColorClasses[color].solid
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                          disabledMinute &&
                            "cursor-not-allowed opacity-40 hover:bg-transparent",
                        )}
                      >
                        {String(minute).padStart(2, "0")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </FormField>
  );
}
