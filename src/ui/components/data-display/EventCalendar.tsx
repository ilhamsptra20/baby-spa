"use client";

import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { Button, Card } from "@/ui/components/common";
import { Input, Select, Textarea } from "@/ui/components/form";
import { Modal } from "@/ui/components/overlay";
import { cn } from "@/ui/utils/cn";

export type EventCalendarViewMode = "month" | "week" | "day";

export type EventCalendarEventType =
  | "meeting"
  | "deadline"
  | "reminder"
  | "conference";

export type EventCalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventCalendarEventType;
  description?: string;
};

export type EventCalendarProps = {
  events?: EventCalendarEvent[];
  defaultEvents?: EventCalendarEvent[];
  value?: string;
  defaultValue?: string;
  defaultView?: EventCalendarViewMode;
  defaultMonth?: string;
  onDateChange?: (date: string) => void;
  onEventsChange?: (events: EventCalendarEvent[]) => void;
  onEventCreate?: (event: EventCalendarEvent) => void;
  onEventUpdate?: (event: EventCalendarEvent) => void;
  onEventDelete?: (event: EventCalendarEvent) => void;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  composerDefaultOpen?: boolean;
  className?: string;
};

type CalendarCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const EVENT_TYPE_OPTIONS: Array<{ label: string; value: EventCalendarEventType }> = [
  { label: "Meeting", value: "meeting" },
  { label: "Deadline", value: "deadline" },
  { label: "Reminder", value: "reminder" },
  { label: "Conference", value: "conference" },
];

const EVENT_TYPE_TONE: Record<EventCalendarEventType, string> = {
  meeting: "border-l-blue-500 bg-blue-50 text-slate-900 dark:bg-blue-500/15 dark:text-blue-100",
  deadline: "border-l-rose-500 bg-rose-50 text-slate-900 dark:bg-rose-500/15 dark:text-rose-100",
  reminder: "border-l-orange-500 bg-orange-50 text-slate-900 dark:bg-orange-500/15 dark:text-orange-100",
  conference: "border-l-emerald-500 bg-emerald-50 text-slate-900 dark:bg-emerald-500/15 dark:text-emerald-100",
};

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function getInitialMonth(defaultMonth: string | undefined, dateValue: string) {
  if (defaultMonth) {
    const [year, month] = defaultMonth.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, 1);
  }

  const date = parseDate(dateValue);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function EventCalendar({
  events,
  defaultEvents = [],
  value,
  defaultValue = formatDate(new Date()),
  defaultView = "month",
  defaultMonth,
  onDateChange,
  onEventsChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  composerDefaultOpen = false,
  className,
}: EventCalendarProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState(defaultValue);
  const [internalEvents, setInternalEvents] = useState(defaultEvents);
  const [currentMonth, setCurrentMonth] = useState(() =>
    getInitialMonth(defaultMonth, value ?? defaultValue),
  );
  const [viewMode, setViewMode] = useState<EventCalendarViewMode>(defaultView);
  const [composerOpen, setComposerOpen] = useState(composerDefaultOpen);
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("09:30");
  const [eventType, setEventType] = useState<EventCalendarEventType>("meeting");
  const [eventDescription, setEventDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const selectedDate = value ?? internalSelectedDate;
  const calendarEvents = events ?? internalEvents;

  function updateSelectedDate(nextDate: string) {
    if (value === undefined) {
      setInternalSelectedDate(nextDate);
    }

    onDateChange?.(nextDate);

    const parsed = parseDate(nextDate);
    setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }

  function updateEvents(nextEvents: EventCalendarEvent[]) {
    if (events === undefined) {
      setInternalEvents(nextEvents);
    }

    onEventsChange?.(nextEvents);
  }

  function shiftCalendar(direction: -1 | 1) {
    if (viewMode === "month") {
      setCurrentMonth((current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
      );
      return;
    }

    const selected = parseDate(selectedDate);
    selected.setDate(selected.getDate() + direction * (viewMode === "week" ? 7 : 1));
    updateSelectedDate(formatDate(selected));
  }

  const monthCells = useMemo<CalendarCell[]>(() => {
    const firstDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const leadingDays = firstDate.getDay();

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        index - leadingDays + 1,
      );

      return {
        date: formatDate(date),
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === currentMonth.getMonth(),
      };
    });
  }, [currentMonth]);

  const visibleCells = useMemo<CalendarCell[]>(() => {
    if (viewMode === "month") {
      return monthCells;
    }

    const selected = parseDate(selectedDate);

    if (viewMode === "day") {
      return [{ date: selectedDate, day: selected.getDate(), inCurrentMonth: true }];
    }

    const weekStart = new Date(selected);
    weekStart.setDate(selected.getDate() - selected.getDay());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        date: formatDate(date),
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === currentMonth.getMonth(),
      };
    });
  }, [currentMonth, monthCells, selectedDate, viewMode]);

  const selectedEvents = useMemo(
    () =>
      calendarEvents
        .filter((event) => event.date === selectedDate)
        .sort((left, right) => left.time.localeCompare(right.time)),
    [calendarEvents, selectedDate],
  );

  const selectedDateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDate(selectedDate));

  function resetComposer() {
    setEditingEventId(null);
    setEventTitle("");
    setEventTime("09:30");
    setEventType("meeting");
    setEventDescription("");
  }

  function closeComposer() {
    setComposerOpen(false);
    resetComposer();
  }

  function openCreateModal() {
    resetComposer();
    setComposerOpen(true);
  }

  function editEvent(event: EventCalendarEvent) {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventTime(event.time);
    setEventType(event.type);
    setEventDescription(event.description ?? "");
    updateSelectedDate(event.date);
    setComposerOpen(true);
  }

  function deleteEvent(eventId: string) {
    const eventToDelete = calendarEvents.find((event) => event.id === eventId);

    if (!eventToDelete) {
      return;
    }

    updateEvents(calendarEvents.filter((event) => event.id !== eventId));
    onEventDelete?.(eventToDelete);

    if (editingEventId === eventId) {
      resetComposer();
    }
  }

  function saveEvent() {
    const title = eventTitle.trim();

    if (!title) {
      return;
    }

    if (editingEventId) {
      const updatedEvent: EventCalendarEvent = {
        id: editingEventId,
        title,
        date: selectedDate,
        time: eventTime,
        type: eventType,
        description: eventDescription.trim() || undefined,
      };

      updateEvents(
        calendarEvents.map((event) =>
          event.id === editingEventId ? updatedEvent : event,
        ),
      );
      onEventUpdate?.(updatedEvent);
      closeComposer();
      return;
    }

    const newEvent: EventCalendarEvent = {
      id: `event-${Date.now()}`,
      title,
      date: selectedDate,
      time: eventTime,
      type: eventType,
      description: eventDescription.trim() || undefined,
    };

    updateEvents([...calendarEvents, newEvent]);
    onEventCreate?.(newEvent);
    closeComposer();
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card contentClassName="p-0" className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => shiftCalendar(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => shiftCalendar(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Next"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            {allowCreate ? (
              <Button
                size="sm"
                color="blue"
                onClick={openCreateModal}
              >
                Add Event +
              </Button>
            ) : null}
          </div>

          <h3 className="text-center text-base font-semibold text-slate-900 dark:text-slate-100">
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          <div className="inline-flex w-fit rounded-md bg-slate-100 p-1 dark:bg-slate-800">
            {(["month", "week", "day"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "h-8 rounded px-4 text-sm font-medium capitalize transition",
                  "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                  viewMode === mode &&
                    "bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {viewMode !== "day" ? (
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
            {WEEK_DAYS.map((day) => (
              <div
                key={day}
                className="border-r border-slate-200 px-4 py-3 text-xs font-semibold text-slate-400 last:border-r-0 dark:border-slate-800 dark:text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>
        ) : null}

        <div className={viewMode === "day" ? "grid grid-cols-1" : "grid grid-cols-7"}>
          {visibleCells.map((cell) => {
            const dayEvents = calendarEvents
              .filter((event) => event.date === cell.date)
              .sort((left, right) => left.time.localeCompare(right.time));
            const isSelected = cell.date === selectedDate;

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => updateSelectedDate(cell.date)}
                className={cn(
                  "border-b border-slate-200 text-left dark:border-slate-800",
                  viewMode === "day"
                    ? "min-h-[420px] bg-white p-5 dark:bg-slate-900"
                    : "min-h-28 border-r p-2 transition last:border-r-0 sm:min-h-32 sm:p-3",
                  viewMode !== "day" &&
                    (isSelected
                      ? "bg-slate-100 dark:bg-slate-800/70"
                      : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"),
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    cell.inCurrentMonth
                      ? "font-semibold text-slate-900 dark:text-slate-100"
                      : "font-medium text-slate-400 dark:text-slate-600",
                  )}
                >
                  {cell.day}
                </span>
                <div className={viewMode === "day" ? "mt-5 grid gap-3" : "mt-3 space-y-1.5"}>
                  {dayEvents.slice(0, viewMode === "month" ? 3 : 8).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "truncate rounded-md border-l-4 px-2.5 py-2 text-xs font-medium",
                        EVENT_TYPE_TONE[event.type],
                      )}
                      title={`${event.time} ${event.title}`}
                    >
                      {viewMode === "day"
                        ? `${event.time} ${event.title} - ${event.description ?? ""}`
                        : event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && viewMode === "month" ? (
                    <p className="px-1 text-xs font-medium text-slate-400">
                      +{dayEvents.length - 3} more
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <section>
        <Card title={selectedDateLabel} description={`${selectedEvents.length} event selected.`}>
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60 sm:grid-cols-[90px_minmax(0,1fr)_auto_auto] sm:items-center"
                >
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <ClockIcon className="h-4 w-4 text-slate-400" />
                    {event.time}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {event.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {event.description ?? "No description."}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex w-fit rounded-full border-l-4 px-2.5 py-1 text-xs font-semibold capitalize",
                      EVENT_TYPE_TONE[event.type],
                    )}
                  >
                    {event.type}
                  </span>
                  {(allowCreate && allowEdit) || allowDelete ? (
                    <div className="flex items-center gap-1">
                      {allowCreate && allowEdit ? (
                        <button
                          type="button"
                          onClick={() => editEvent(event)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                          aria-label={`Edit ${event.title}`}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                      {allowDelete ? (
                        <button
                          type="button"
                          onClick={() => deleteEvent(event.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                          aria-label={`Delete ${event.title}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <CalendarDaysIcon className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                No event selected
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Click a date or create an event for this day.
              </p>
            </div>
          )}
        </Card>

        {allowCreate ? (
          <Modal
            open={composerOpen}
            title={editingEventId ? "Edit Event" : "Add Event"}
            description="Event disimpan ke state component."
            onClose={closeComposer}
            footer={
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={closeComposer}>
                  Cancel
                </Button>
                <Button onClick={saveEvent}>
                  {editingEventId ? "Update Event" : "Save Event"}
                </Button>
              </div>
            }
          >
            <div className="grid gap-4">
              <Input
                label="Event title"
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                placeholder="Release planning"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(event) => updateSelectedDate(event.target.value)}
                />
                <Input
                  label="Time"
                  type="time"
                  value={eventTime}
                  onChange={(event) => setEventTime(event.target.value)}
                />
              </div>
              <Select
                label="Type"
                value={eventType}
                onChange={(nextType) => setEventType(nextType as EventCalendarEventType)}
                options={EVENT_TYPE_OPTIONS}
              />
              <Textarea
                label="Description"
                value={eventDescription}
                onChange={(event) => setEventDescription(event.target.value)}
                placeholder="Catatan event"
              />
            </div>
          </Modal>
        ) : null}
      </section>
    </div>
  );
}
