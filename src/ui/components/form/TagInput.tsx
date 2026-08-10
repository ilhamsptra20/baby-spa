"use client";

import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { type KeyboardEvent, useState } from "react";

import { FormField } from "@/ui/components/form/FormField";
import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type TagInputProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  color?: UIColor;
  className?: string;
};

export function TagInput({
  id,
  name,
  label,
  value = [],
  onChange,
  placeholder = "Ketik lalu tekan Enter",
  maxTags,
  helperText,
  error,
  disabled = false,
  required = false,
  color = "slate",
  className,
}: TagInputProps) {
  const fieldId = id ?? name;
  const [inputValue, setInputValue] = useState("");

  function addTag(rawTag: string) {
    const tag = rawTag.trim();
    if (!tag) {
      return;
    }

    const duplicate = value.some((item) => item.toLowerCase() === tag.toLowerCase());
    if (duplicate) {
      return;
    }

    if (maxTags !== undefined && value.length >= maxTags) {
      return;
    }

    onChange?.([...value, tag]);
    setInputValue("");
  }

  function removeTag(targetTag: string) {
    onChange?.(value.filter((item) => item !== targetTag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(inputValue);
      return;
    }

    if (event.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1] ?? "");
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
      {name && !disabled
        ? value.map((tag) => <input key={tag} type="hidden" name={name} value={tag} />)
        : null}
      <div
        className={cn(
          "space-y-2 rounded-md border border-slate-300 bg-white dark:bg-slate-900 p-2 shadow-xs transition duration-200 focus-within:ring-2",
          fieldColorClasses[color].focusWithin,
          disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800",
          error && "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100",
          className,
        )}
      >
        <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <TagIcon className="h-4 w-4" aria-hidden="true" />
          Tags
        </div>

        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((tag) => (
              <span
                key={tag}
                className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", fieldColorClasses[color].soft)}
              >
                <span className="max-w-40 truncate">{tag}</span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full p-0.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        <input
          id={fieldId}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required && value.length === 0}
          className="h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:text-slate-500 focus:border-slate-200 dark:border-slate-700"
        />
      </div>
    </FormField>
  );
}
