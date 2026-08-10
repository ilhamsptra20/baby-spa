"use client";

import {
  CalendarDaysIcon,
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
import {
  formatDateTimeDisplay,
  formatTimeString,
  parseDateString,
  parseTimeString,
} from "@/ui/utils/date";

import { Calendar } from "./Calendar";

type ParsedDateTime = {
  date: string;
  time: string;
};

export type DateTimeInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  minuteStep?: number;
  color?: UIColor;
  className?: string;
};

function splitDateTime(value?: string): ParsedDateTime {
  if (!value) {
    return { date: "", time: "" };
  }

  const [datePart = "", timePart = ""] = value.split("T");
  const validDate = parseDateString(datePart) ? datePart : "";
  const parsedTime = parseTimeString(timePart);
  const validTime = parsedTime
    ? formatTimeString(parsedTime.hours, parsedTime.minutes)
    : "";

  return { date: validDate, time: validTime };
}

function splitDateTimeBound(value?: string): ParsedDateTime {
  return splitDateTime(value);
}

function timeToMinutes(value?: string): number | null {
  const parsed = parseTimeString(value);

  if (!parsed) {
    return null;
  }

  return parsed.hours * 60 + parsed.minutes;
}

function getMinuteStep(minuteStep?: number) {
  if (typeof minuteStep === "number" && minuteStep > 0) {
    return Math.max(1, Math.min(30, Math.floor(minuteStep)));
  }

  return 5;
}

export function DateTimeInput({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder = "Pilih tanggal dan waktu",
  min,
  max,
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = false,
  minuteStep,
  color = "slate",
  className,
}: DateTimeInputProps) {
  const fieldId = id ?? name ?? "datetime-input";
  const panelId = `${fieldId}-datetime-panel`;
  const hasValue = value.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const rightPaddingClass = showClear ? "pr-16" : "pr-10";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const current = splitDateTime(value);
  const minBound = splitDateTimeBound(min);
  const maxBound = splitDateTimeBound(max);

  const [draftTime, setDraftTime] = useState("00:00");
  const [selectedHourState, setSelectedHourState] = useState<number>(0);
  const selectedHour =
    parseTimeString(current.time)?.hours ?? selectedHourState;

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

  const resolvedMinuteStep = getMinuteStep(minuteStep);

  const minuteOptions = useMemo(() => {
    const values: number[] = [];

    for (let minute = 0; minute < 60; minute += resolvedMinuteStep) {
      values.push(minute);
    }

    return values;
  }, [resolvedMinuteStep]);

  function getMinTimeForDate(dateValue: string) {
    return minBound.date && minBound.date === dateValue ? minBound.time : undefined;
  }

  function getMaxTimeForDate(dateValue: string) {
    return maxBound.date && maxBound.date === dateValue ? maxBound.time : undefined;
  }

  function isAllowedTime(timeValue: string, dateValue: string) {
    const timeInMinutes = timeToMinutes(timeValue);

    if (timeInMinutes === null) {
      return false;
    }

    const minInMinutes = timeToMinutes(getMinTimeForDate(dateValue));
    const maxInMinutes = timeToMinutes(getMaxTimeForDate(dateValue));

    if (minInMinutes !== null && timeInMinutes < minInMinutes) {
      return false;
    }

    if (maxInMinutes !== null && timeInMinutes > maxInMinutes) {
      return false;
    }

    return true;
  }

  function clampTime(dateValue: string, timeValue: string) {
    const timeInMinutes = timeToMinutes(timeValue);

    if (timeInMinutes === null) {
      return "00:00";
    }

    const minInMinutes = timeToMinutes(getMinTimeForDate(dateValue));
    const maxInMinutes = timeToMinutes(getMaxTimeForDate(dateValue));

    if (minInMinutes !== null && timeInMinutes < minInMinutes) {
      return getMinTimeForDate(dateValue) ?? timeValue;
    }

    if (maxInMinutes !== null && timeInMinutes > maxInMinutes) {
      return getMaxTimeForDate(dateValue) ?? timeValue;
    }

    return timeValue;
  }

  function findFirstAllowedMinute(hour: number, dateValue: string): number | null {
    for (const minute of minuteOptions) {
      const timeValue = formatTimeString(hour, minute);

      if (isAllowedTime(timeValue, dateValue)) {
        return minute;
      }
    }

    return null;
  }

  function handleDateChange(nextDate: string) {
    const baseTime = current.time || draftTime || "00:00";
    const nextTime = clampTime(nextDate, baseTime);

    setDraftTime(nextTime);
    setSelectedHourState(parseTimeString(nextTime)?.hours ?? 0);
    onChange?.(`${nextDate}T${nextTime}`);
  }

  function handleHourSelect(hour: number) {
    if (!current.date) {
      setSelectedHourState(hour);
      return;
    }

    const minute = findFirstAllowedMinute(hour, current.date);

    if (minute === null) {
      return;
    }

    const nextTime = formatTimeString(hour, minute);
    setSelectedHourState(hour);
    setDraftTime(nextTime);
    onChange?.(`${current.date}T${nextTime}`);
  }

  function handleMinuteSelect(minute: number) {
    if (!current.date) {
      const nextTime = formatTimeString(selectedHour, minute);
      setDraftTime(nextTime);
      return;
    }

    const nextTime = formatTimeString(selectedHour, minute);

    if (!isAllowedTime(nextTime, current.date)) {
      return;
    }

    setDraftTime(nextTime);
    onChange?.(`${current.date}T${nextTime}`);
    setOpen(false);
  }

  function isHourDisabled(hour: number) {
    if (!current.date) {
      return false;
    }

    return findFirstAllowedMinute(hour, current.date) === null;
  }

  function isMinuteDisabled(minute: number) {
    if (!current.date) {
      return false;
    }

    return !isAllowedTime(formatTimeString(selectedHour, minute), current.date);
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

  const displayValue = formatDateTimeDisplay(value);

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
          aria-controls={panelId}
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
          <CalendarDaysIcon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />

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
              aria-label="Clear date and time"
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
          id={panelId}
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top transition-all duration-200",
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-lg">
            <div className="grid gap-3 lg:grid-cols-[1fr_14rem]">
              <Calendar
                value={current.date}
                onChange={handleDateChange}
                min={minBound.date || undefined}
                max={maxBound.date || undefined}
                onEscape={() => setOpen(false)}
                color={color}
                className="w-full max-w-none border-slate-200 dark:border-slate-700 p-2 shadow-none"
              />

              <div className="space-y-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <ClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Time
                </div>

                {!current.date ? (
                  <p className="rounded-md bg-white dark:bg-slate-900 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                    Pilih tanggal terlebih dulu untuk mengatur jam.
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Jam
                    </p>
                    <ul className="max-h-44 space-y-0.5 overflow-y-auto rounded-md bg-white dark:bg-slate-900 p-1">
                      {Array.from({ length: 24 }, (_, index) => index).map((hour) => {
                        const active = selectedHour === hour;
                        const hourDisabled = isHourDisabled(hour);

                        return (
                          <li key={hour}>
                            <button
                              type="button"
                              onClick={() => handleHourSelect(hour)}
                              disabled={hourDisabled}
                              className={cn(
                                "w-full rounded-md px-2 py-1 text-left text-sm transition",
                                active ? buttonColorClasses[color].solid : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                                hourDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
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
                    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Menit
                    </p>
                    <ul className="max-h-44 space-y-0.5 overflow-y-auto rounded-md bg-white dark:bg-slate-900 p-1">
                      {minuteOptions.map((minute) => {
                        const active = parseTimeString(current.time || draftTime)?.minutes === minute;
                        const minuteDisabled = isMinuteDisabled(minute);

                        return (
                          <li key={minute}>
                            <button
                              type="button"
                              onClick={() => handleMinuteSelect(minute)}
                              disabled={minuteDisabled}
                              className={cn(
                                "w-full rounded-md px-2 py-1 text-left text-sm transition",
                                active ? buttonColorClasses[color].solid : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                                minuteDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
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
          </div>
        </div>
      </div>
    </FormField>
  );
}
