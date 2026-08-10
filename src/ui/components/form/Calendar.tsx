"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { UIColor } from "@/ui/types/color";
import { buttonColorClasses, fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";
import {
  WEEKDAY_SHORT_NAMES,
  addDays,
  addMonths,
  compareDateString,
  formatDateString,
  getMonthDays,
  getTodayString,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  parseDateString,
} from "@/ui/utils/date";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const YEAR_PAST_RANGE = 100;
const YEAR_FUTURE_RANGE = 20;
const YEAR_NAV_JUMP = 12;

type CalendarViewMode = "days" | "months" | "years";

export type CalendarRangeValue = {
  start?: string;
  end?: string;
};

type CalendarBaseProps = {
  min?: string;
  max?: string;
  disabledDates?: string[];
  color?: UIColor;
  className?: string;
  onEscape?: () => void;
};

type CalendarSingleProps = CalendarBaseProps & {
  range?: false;
  value?: string;
  onChange?: (value: string) => void;
};

type CalendarRangeProps = CalendarBaseProps & {
  range: true;
  value?: CalendarRangeValue;
  onChange?: (value: CalendarRangeValue) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

function getFirstMonthDate(dateString?: string): Date {
  const parsed = parseDateString(dateString);

  if (!parsed) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
}

function clampDateToMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function Calendar(props: CalendarProps) {
  const {
    min,
    max,
    disabledDates,
    color = "slate",
    className,
    onEscape,
  } = props;

  const range = props.range === true;

  const selectedDate = range ? undefined : props.value;
  const rangeStart = range ? props.value?.start : undefined;
  const rangeEnd = range ? props.value?.end : undefined;

  const anchorValue = range ? rangeStart ?? rangeEnd : selectedDate;
  const todayString = getTodayString();

  const [viewMonth, setViewMonth] = useState<Date>(() => getFirstMonthDate(anchorValue));
  const [focusedDate, setFocusedDate] = useState<string>(anchorValue ?? todayString);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("days");

  const disabledDateSet = useMemo(() => new Set(disabledDates ?? []), [disabledDates]);
  const minDate = useMemo(() => parseDateString(min), [min]);
  const maxDate = useMemo(() => parseDateString(max), [max]);

  const monthDays = useMemo(() => getMonthDays(viewMonth), [viewMonth]);

  const weekRows = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) =>
        monthDays.slice(index * 7, index * 7 + 7),
      ),
    [monthDays],
  );

  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(() => {
    const selectedYear = parseDateString(anchorValue)?.getFullYear();

    const minCandidates = [currentYear - YEAR_PAST_RANGE];
    const maxCandidates = [currentYear + YEAR_FUTURE_RANGE];

    if (minDate) {
      minCandidates.push(minDate.getFullYear());
    }

    if (maxDate) {
      maxCandidates.push(maxDate.getFullYear());
    }

    if (selectedYear) {
      minCandidates.push(selectedYear);
      maxCandidates.push(selectedYear);
    }

    const minYear = Math.min(...minCandidates);
    const maxYear = Math.max(...maxCandidates);

    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
  }, [anchorValue, currentYear, maxDate, minDate]);

  const yearItemRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (viewMode !== "years") {
      return;
    }

    const selectedYear = parseDateString(anchorValue)?.getFullYear();
    const targetYear = selectedYear ?? viewMonth.getFullYear();
    const targetNode = yearItemRefs.current[targetYear];

    if (targetNode) {
      targetNode.scrollIntoView({ block: "center" });
    }
  }, [anchorValue, viewMode, viewMonth]);

  function isDateDisabled(value: string) {
    if (disabledDateSet.has(value)) {
      return true;
    }

    if (min && isBeforeDay(value, min)) {
      return true;
    }

    if (max && isAfterDay(value, max)) {
      return true;
    }

    return false;
  }

  function isMonthDisabled(year: number, month: number) {
    const monthStart = clampDateToMonth(new Date(year, month, 1));
    const monthEnd = clampDateToMonth(new Date(year, month + 1, 0));

    if (minDate && monthEnd.getTime() < minDate.getTime()) {
      return true;
    }

    if (maxDate && monthStart.getTime() > maxDate.getTime()) {
      return true;
    }

    return false;
  }

  function isYearDisabled(year: number) {
    const yearStart = clampDateToMonth(new Date(year, 0, 1));
    const yearEnd = clampDateToMonth(new Date(year, 11, 31));

    if (minDate && yearEnd.getTime() < minDate.getTime()) {
      return true;
    }

    if (maxDate && yearStart.getTime() > maxDate.getTime()) {
      return true;
    }

    return false;
  }

  function emitSelect(nextValue: string) {
    if (isDateDisabled(nextValue)) {
      return;
    }

    if (range) {
      const start = props.value?.start;
      const end = props.value?.end;

      if (!start || (start && end)) {
        props.onChange?.({ start: nextValue, end: undefined });
        return;
      }

      if (isBeforeDay(nextValue, start)) {
        props.onChange?.({ start: nextValue, end: undefined });
        return;
      }

      props.onChange?.({ start, end: nextValue });
      return;
    }

    props.onChange?.(nextValue);
  }

  function moveFocus(dayOffset: number) {
    const parsedFocusedDate = parseDateString(focusedDate);
    const currentDate = parsedFocusedDate ?? parseDateString(todayString);

    if (!currentDate) {
      return;
    }

    const nextDate = addDays(currentDate, dayOffset);
    const nextValue = formatDateString(nextDate);

    setFocusedDate(nextValue);
    setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  }

  function shiftView(step: number) {
    if (viewMode === "days") {
      setViewMonth((previous) => addMonths(previous, step));
      return;
    }

    if (viewMode === "months") {
      setViewMonth((previous) => new Date(previous.getFullYear() + step, previous.getMonth(), 1));
      return;
    }

    setViewMonth((previous) => new Date(previous.getFullYear() + step * YEAR_NAV_JUMP, previous.getMonth(), 1));
  }

  function handleMonthPick(month: number) {
    if (isMonthDisabled(viewMonth.getFullYear(), month)) {
      return;
    }

    const nextMonth = new Date(viewMonth.getFullYear(), month, 1);
    setViewMonth(nextMonth);

    const nextFocusDate = formatDateString(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
    setFocusedDate(nextFocusDate);
    setViewMode("days");
  }

  function handleYearPick(year: number) {
    if (isYearDisabled(year)) {
      return;
    }

    const nextMonth = new Date(year, viewMonth.getMonth(), 1);
    setViewMonth(nextMonth);

    const nextFocusDate = formatDateString(new Date(year, nextMonth.getMonth(), 1));
    setFocusedDate(nextFocusDate);
    setViewMode("days");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();

      if (viewMode !== "days") {
        setViewMode("days");
        return;
      }

      onEscape?.();
      return;
    }

    if (viewMode !== "days") {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-7);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(7);
      return;
    }

    if (event.key === "PageUp") {
      event.preventDefault();
      setViewMonth((previous) => addMonths(previous, -1));
      return;
    }

    if (event.key === "PageDown") {
      event.preventDefault();
      setViewMonth((previous) => addMonths(previous, 1));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      emitSelect(focusedDate);
    }
  }

  const monthLabel = MONTH_NAMES[viewMonth.getMonth()];
  const yearLabel = String(viewMonth.getFullYear());

  return (
    <div
      role="application"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-lg outline-none",
        "focus-visible:ring-2 focus-visible:ring-slate-300",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1">
        <button
          type="button"
          onClick={() => shiftView(-1)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label={viewMode === "days" ? "Bulan sebelumnya" : "Navigasi sebelumnya"}
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode((previous) => (previous === "months" ? "days" : "months"))}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            aria-expanded={viewMode === "months"}
            aria-label="Pilih bulan"
          >
            <span>{monthLabel}</span>
            <ChevronDownIcon
              className={cn("h-3.5 w-3.5 text-slate-500 dark:text-slate-400 transition-transform", viewMode === "months" && "rotate-180")}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => setViewMode((previous) => (previous === "years" ? "days" : "years"))}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            aria-expanded={viewMode === "years"}
            aria-label="Pilih tahun"
          >
            <span>{yearLabel}</span>
            <ChevronDownIcon
              className={cn("h-3.5 w-3.5 text-slate-500 dark:text-slate-400 transition-transform", viewMode === "years" && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        </div>

        <button
          type="button"
          onClick={() => shiftView(1)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label={viewMode === "days" ? "Bulan berikutnya" : "Navigasi berikutnya"}
        >
          <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-[17rem]">
        {viewMode === "days" ? (
          <div className="animate-[ui-overlay-fade-in_140ms_ease-out]">
            <div className="grid grid-cols-7 gap-1 pb-1">
              {WEEKDAY_SHORT_NAMES.map((weekday) => (
                <span
                  key={weekday}
                  className="flex h-8 items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="space-y-1" role="grid" aria-label="Calendar">
              {weekRows.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1" role="row">
                  {week.map((day) => {
                    const disabled = isDateDisabled(day.value);
                    const isSelected = !range && isSameDay(day.value, selectedDate);
                    const isStart = range && Boolean(rangeStart) && isSameDay(day.value, rangeStart);
                    const isEnd = range && Boolean(rangeEnd) && isSameDay(day.value, rangeEnd);
                    const isInRange =
                      range &&
                      Boolean(rangeStart) &&
                      Boolean(rangeEnd) &&
                      compareDateString(day.value, rangeStart) === 1 &&
                      compareDateString(day.value, rangeEnd) === -1;
                    const isRangeEdge = isStart || isEnd;
                    const isFocused = isSameDay(day.value, focusedDate);

                    return (
                      <button
                        key={day.value}
                        type="button"
                        role="gridcell"
                        aria-selected={isSelected || isRangeEdge || isInRange}
                        disabled={disabled}
                        onMouseEnter={() => setFocusedDate(day.value)}
                        onClick={() => {
                          setFocusedDate(day.value);
                          emitSelect(day.value);
                        }}
                        className={cn(
                          "relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition",
                          "focus-visible:outline-none focus-visible:ring-2",
                          fieldColorClasses[color].focusVisible,
                          !day.inCurrentMonth && "text-slate-400 dark:text-slate-500",
                          day.inCurrentMonth && "text-slate-700 dark:text-slate-200",
                          day.isToday && !isSelected && !isRangeEdge && "ring-1 ring-slate-300",
                          isInRange && cn("rounded-none", fieldColorClasses[color].soft),
                          isRangeEdge && buttonColorClasses[color].solid,
                          isSelected && buttonColorClasses[color].solid,
                          !isSelected && !isRangeEdge && !isInRange && "hover:bg-slate-100 dark:hover:bg-slate-800",
                          disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                          isFocused && !disabled && !isSelected && !isRangeEdge && "ring-1 ring-slate-300",
                          isStart && "rounded-l-md",
                          isEnd && "rounded-r-md",
                        )}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {viewMode === "months" ? (
          <div className="animate-[ui-overlay-fade-in_140ms_ease-out] pt-2">
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES_SHORT.map((monthName, index) => {
                const selected = index === viewMonth.getMonth();
                const disabled = isMonthDisabled(viewMonth.getFullYear(), index);

                return (
                  <button
                    key={monthName}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleMonthPick(index)}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-md text-sm font-medium transition",
                      "focus-visible:outline-none focus-visible:ring-2",
                      fieldColorClasses[color].focusVisible,
                      selected
                        ? buttonColorClasses[color].solid
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                      disabled && "cursor-not-allowed opacity-40 hover:bg-white dark:bg-slate-900",
                    )}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {viewMode === "years" ? (
          <div className="animate-[ui-overlay-fade-in_140ms_ease-out] pt-1">
            <div className="max-h-[16.5rem] overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-1.5">
              <ul className="space-y-1">
                {yearOptions.map((year) => {
                  const selected = year === viewMonth.getFullYear();
                  const disabled = isYearDisabled(year);

                  return (
                    <li key={year}>
                      <button
                        ref={(node) => {
                          yearItemRefs.current[year] = node;
                        }}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleYearPick(year)}
                        className={cn(
                          "inline-flex h-9 w-full items-center justify-center rounded-md px-2 text-sm font-medium transition",
                          "focus-visible:outline-none focus-visible:ring-2",
                          fieldColorClasses[color].focusVisible,
                          selected
                            ? buttonColorClasses[color].solid
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                          disabled && "cursor-not-allowed opacity-40 hover:bg-white dark:bg-slate-900",
                        )}
                      >
                        {year}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
