"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ScrollArea } from "@/ui/components/common";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectBaseProps = {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  errorMessage?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  noOptionsText?: string;
  color?: UIColor;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
};

type SelectSingleProps = SelectBaseProps & {
  multiple?: false;
  value?: string;
  onChange?: (value: string) => void;
};

type SelectMultipleProps = SelectBaseProps & {
  multiple: true;
  value?: string[];
  onChange?: (value: string[]) => void;
};

export type SelectProps = SelectSingleProps | SelectMultipleProps;

function findFirstEnabledIndex(options: SelectOption[]) {
  const index = options.findIndex((option) => !option.disabled);
  return index >= 0 ? index : 0;
}

export function Select(props: SelectProps) {
  const {
    id,
    name,
    label,
    placeholder = "Select option",
    options,
    helperText,
    error,
    errorMessage,
    disabled = false,
    clearable = false,
    searchable = false,
    noOptionsText = "No matching options.",
    color = "slate",
    className,
    containerClassName,
    dropdownClassName,
  } = props;

  const multiple = props.multiple === true;
  const resolvedError = error ?? errorMessage;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const fieldId = id ?? name ?? "select-field";
  const descriptionId = `${fieldId}-description`;
  const listId = `${fieldId}-listbox`;

  const selectedValues = useMemo(
    () => (multiple ? props.value ?? [] : props.value ? [props.value] : []),
    [multiple, props.value],
  );

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.value)),
    [options, selectedSet],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) {
      return options;
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (searchable) {
      searchInputRef.current?.focus();
    } else {
      listRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function emitSingle(nextValue: string) {
    if (!multiple) {
      props.onChange?.(nextValue);
    }
  }

  function emitMultiple(nextValues: string[]) {
    if (multiple) {
      props.onChange?.(nextValues);
    }
  }

  function openDropdown() {
    setHighlightedIndex(findFirstEnabledIndex(filteredOptions));
    setOpen(true);
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  function handleSelectOption(option: SelectOption) {
    if (option.disabled) {
      return;
    }

    if (multiple) {
      const currentValues = props.value ?? [];
      const exists = currentValues.includes(option.value);
      const nextValues = exists
        ? currentValues.filter((item) => item !== option.value)
        : [...currentValues, option.value];

      emitMultiple(nextValues);
      return;
    }

    emitSingle(option.value);
    closeDropdown();
  }

  function clearSelection() {
    if (multiple) {
      emitMultiple([]);
      return;
    }

    emitSingle("");
  }

  function removeMultipleValue(valueToRemove: string) {
    if (!multiple) {
      return;
    }

    const currentValues = props.value ?? [];
    emitMultiple(currentValues.filter((item) => item !== valueToRemove));
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

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        openDropdown();
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  }

  function handleDropdownKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight("down");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight("up");
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const highlightedOption = filteredOptions[highlightedIndex];
      if (highlightedOption) {
        handleSelectOption(highlightedOption);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  }

  const hasValue = selectedValues.length > 0;
  const showClear = clearable && hasValue && !disabled;
  const rightPaddingClass = showClear ? "pr-16" : "pr-10";

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      ) : null}
      {name && !disabled
        ? selectedValues.map((selectedValue) => (
          <input key={selectedValue} type="hidden" name={name} value={selectedValue} />
        ))
        : null}

      <div ref={containerRef} className={cn("relative", open && "z-[120]")}>
        <div
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-disabled={disabled}
          aria-invalid={Boolean(resolvedError)}
          aria-describedby={resolvedError || helperText ? descriptionId : undefined}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "relative flex min-h-10 w-full items-center gap-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 shadow-xs outline-none transition duration-200 focus-visible:ring-2",
            rightPaddingClass,
            fieldColorClasses[color].focusVisible,
            disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
            resolvedError && "border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-100",
            className,
          )}
          onClick={() => {
            if (disabled) {
              return;
            }

            if (open) {
              closeDropdown();
            } else {
              openDropdown();
            }
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <div className="min-w-0 flex-1">
            {multiple ? (
              hasValue ? (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.map((option) => (
                    <span
                      key={option.value}
                      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", fieldColorClasses[color].soft)}
                    >
                      <span className="truncate max-w-32">{option.label}</span>
                      {!disabled ? (
                        <button
                          type="button"
                          className="rounded-full p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeMultipleValue(option.value);
                          }}
                          aria-label={`Remove ${option.label}`}
                        >
                          <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
              )
            ) : hasValue ? (
              <span className="truncate">{selectedOptions[0]?.label}</span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
            {showClear ? (
              <button
                type="button"
                className="pointer-events-auto rounded p-0.5 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                onClick={(event) => {
                  event.stopPropagation();
                  clearSelection();
                }}
                aria-label="Clear selection"
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
        </div>

        <div
          className={cn(
            "absolute z-[120] mt-1.5 w-full origin-top rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl transition-all duration-200",
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
            dropdownClassName,
          )}
        >
          {searchable ? (
            <div className="relative mb-2">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  setQuery(nextQuery);
                  const nextFiltered = options.filter((option) =>
                    option.label.toLowerCase().includes(nextQuery.trim().toLowerCase()),
                  );
                  setHighlightedIndex(findFirstEnabledIndex(nextFiltered));
                }}
                onKeyDown={(event) => handleDropdownKeyDown(event)}
                placeholder="Search option..."
                className={cn(
                  "h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:ring-2",
                  fieldColorClasses[color].focus,
                )}
              />
            </div>
          ) : null}

          <ScrollArea viewportClassName="max-h-56 focus:outline-none" hideScrollbarUntilHover>
            <div
              ref={listRef}
              tabIndex={searchable ? -1 : 0}
              onKeyDown={(event) => handleDropdownKeyDown(event)}
              className="focus:outline-none"
            >
              <ul id={listId} role="listbox" aria-label={label ?? "Select"}>
              {filteredOptions.length === 0 ? (
                <li className="rounded-md px-3 py-2 text-sm text-slate-500 dark:text-slate-400">{noOptionsText}</li>
              ) : (
                filteredOptions.map((option, index) => {
                  const selected = selectedSet.has(option.value);
                  const highlighted = index === highlightedIndex;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        disabled={option.disabled}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={() => handleSelectOption(option)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition",
                          highlighted && "bg-slate-100 dark:bg-slate-800",
                          selected ? cn("font-medium", fieldColorClasses[color].text) : "text-slate-700 dark:text-slate-200",
                          option.disabled && "cursor-not-allowed opacity-50",
                        )}
                        role="option"
                        aria-selected={selected}
                      >
                        <span className="truncate">{option.label}</span>
                        {selected ? (
                          <CheckIcon className={cn("h-4 w-4 shrink-0", fieldColorClasses[color].text)} aria-hidden="true" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </div>

      {resolvedError ? (
        <p id={descriptionId} className="text-sm text-rose-600">
          {resolvedError}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
