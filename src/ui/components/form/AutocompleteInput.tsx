"use client";

import {
  ArrowPathIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { ScrollArea } from "@/ui/components/common";
import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type AutocompleteOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type AutocompleteInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  loading?: boolean;
  emptyText?: string;
  color?: UIColor;
  className?: string;
};

function findFirstEnabledIndex(options: AutocompleteOption[]) {
  const index = options.findIndex((option) => !option.disabled);
  return index >= 0 ? index : 0;
}

export function AutocompleteInput({
  id,
  name,
  label,
  value = "",
  onChange,
  onSelect,
  options,
  placeholder = "Cari...",
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = true,
  loading = false,
  emptyText = "No matching option.",
  color = "slate",
  className,
}: AutocompleteInputProps) {
  const fieldId = id ?? name ?? "autocomplete-input";
  const listId = `${fieldId}-listbox`;
  const showClear = clearable && value.length > 0 && !disabled;
  const rightIconCount = 1 + (loading ? 1 : 0) + (showClear ? 1 : 0);
  const rightPaddingClass =
    rightIconCount >= 3 ? "pr-20" : rightIconCount === 2 ? "pr-16" : "pr-10";
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  function selectOption(option: AutocompleteOption) {
    if (option.disabled) {
      return;
    }

    onChange?.(option.label);
    onSelect?.(option);
    setOpen(false);
  }

  function moveHighlight(direction: "up" | "down") {
    if (filteredOptions.length === 0) {
      return;
    }

    let nextIndex = highlightedIndex;

    for (let i = 0; i < filteredOptions.length; i += 1) {
      nextIndex =
        direction === "down"
          ? (nextIndex + 1) % filteredOptions.length
          : (nextIndex - 1 + filteredOptions.length) % filteredOptions.length;

      if (!filteredOptions[nextIndex]?.disabled) {
        setHighlightedIndex(nextIndex);
        break;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
      moveHighlight("down");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
      moveHighlight("up");
      return;
    }

    if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      <div ref={containerRef} className={cn("relative", open && "z-[120]")}>
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />

        <input
          id={fieldId}
          name={name}
          type="text"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            const nextFiltered = options.filter((option) =>
              option.label.toLowerCase().includes(nextValue.trim().toLowerCase()),
            );

            setHighlightedIndex(findFirstEnabledIndex(nextFiltered));
            onChange?.(nextValue);
            setOpen(true);
          }}
          onFocus={() => {
            setHighlightedIndex(findFirstEnabledIndex(filteredOptions));
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-9 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 placeholder:text-slate-400 dark:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-800 disabled:text-slate-500 dark:text-slate-400",
            rightPaddingClass,
            fieldColorClasses[color].focus,
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
            className,
          )}
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}

          {showClear ? (
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Clear autocomplete value"
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
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200",
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
              <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : filteredOptions.length === 0 ? (
            <p className="rounded-md px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
          ) : (
            <ScrollArea viewportClassName="max-h-56" hideScrollbarUntilHover>
              <ul id={listId} role="listbox">
                {filteredOptions.map((option, index) => {
                  const highlighted = index === highlightedIndex;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => selectOption(option)}
                        disabled={option.disabled}
                        className={cn(
                          "flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition",
                          highlighted ? fieldColorClasses[color].soft : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/60",
                          option.disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </div>
      </div>
    </FormField>
  );
}
