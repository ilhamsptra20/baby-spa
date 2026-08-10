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
];

export const WEEKDAY_SHORT_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDayTimestamp(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function parseDateString(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function formatDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseTimeString(value?: string): { hours: number; minutes: number } | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

export function formatTimeString(hours: number, minutes: number): string {
  const nextHours = Math.max(0, Math.min(23, hours));
  const nextMinutes = Math.max(0, Math.min(59, minutes));
  return `${pad(nextHours)}:${pad(nextMinutes)}`;
}

export function formatDateDisplay(value?: string): string {
  const parsed = parseDateString(value);

  if (!parsed) {
    return "";
  }

  return `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()}`;
}

export function formatDateTimeDisplay(value?: string): string {
  if (!value) {
    return "";
  }

  const [datePart, timePart] = value.split("T");
  const formattedDate = formatDateDisplay(datePart);

  if (!formattedDate) {
    return "";
  }

  if (!timePart) {
    return formattedDate;
  }

  const parsedTime = parseTimeString(timePart);

  if (!parsedTime) {
    return formattedDate;
  }

  return `${formattedDate} ${formatTimeString(parsedTime.hours, parsedTime.minutes)}`;
}

export function getTodayString(): string {
  return formatDateString(new Date());
}

function toDate(value: Date | string | undefined | null): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  return parseDateString(value);
}

export function isSameDay(
  left: Date | string | undefined | null,
  right: Date | string | undefined | null,
): boolean {
  const leftDate = toDate(left);
  const rightDate = toDate(right);

  if (!leftDate || !rightDate) {
    return false;
  }

  return getDayTimestamp(leftDate) === getDayTimestamp(rightDate);
}

export function isBeforeDay(
  left: Date | string | undefined | null,
  right: Date | string | undefined | null,
): boolean {
  const leftDate = toDate(left);
  const rightDate = toDate(right);

  if (!leftDate || !rightDate) {
    return false;
  }

  return getDayTimestamp(leftDate) < getDayTimestamp(rightDate);
}

export function isAfterDay(
  left: Date | string | undefined | null,
  right: Date | string | undefined | null,
): boolean {
  const leftDate = toDate(left);
  const rightDate = toDate(right);

  if (!leftDate || !rightDate) {
    return false;
  }

  return getDayTimestamp(leftDate) > getDayTimestamp(rightDate);
}

export function compareDateString(left?: string, right?: string): number {
  const leftDate = parseDateString(left);
  const rightDate = parseDateString(right);

  if (!leftDate || !rightDate) {
    return 0;
  }

  const leftTime = getDayTimestamp(leftDate);
  const rightTime = getDayTimestamp(rightDate);

  if (leftTime === rightTime) {
    return 0;
  }

  return leftTime < rightTime ? -1 : 1;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export type CalendarDayCell = {
  value: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
};

export function getMonthDays(monthDate: Date): CalendarDayCell[] {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

  const leadingDays = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const today = getTodayString();

  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - leadingDays + 1;
    const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayOffset);

    cells.push({
      value: formatDateString(cellDate),
      day: cellDate.getDate(),
      inCurrentMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
      isToday: isSameDay(cellDate, today),
    });
  }

  return cells;
}

export function getMonthLabel(monthDate: Date): string {
  return `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
}
