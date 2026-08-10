"use client";

import {
  ArrowUpTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type ChangeEvent, type DragEvent, useId, useMemo, useRef, useState } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

import { Button } from "../common/Button";
import { FormError } from "./FormError";
import { FormLabel } from "./FormLabel";

export interface FileUploadProps {
  id?: string;
  name?: string;
  label?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  accept?: string;
  color?: UIColor;
  className?: string;
}

function formatFileSize(file: File) {
  if (file.size < 1024) {
    return `${file.size} B`;
  }

  if (file.size < 1024 * 1024) {
    return `${(file.size / 1024).toFixed(1)} KB`;
  }

  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "Drag and drop a file here, or click to browse",
  helperText,
  error,
  disabled = false,
  accept,
  color = "slate",
  className,
}: FileUploadProps) {
  const generatedId = useId();
  const inputId = id ?? `${name ? `${name}-` : "file-upload-"}${generatedId}`;
  const descriptionId = `${inputId}-description`;

  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const isControlled = value !== undefined;
  const selectedFile = isControlled ? value : internalFile;

  const selectedFileMeta = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return `${selectedFile.name} (${formatFileSize(selectedFile)})`;
  }, [selectedFile]);

  function updateFile(nextFile: File | null) {
    if (!isControlled) {
      setInternalFile(nextFile);
    }

    onChange?.(nextFile);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    updateFile(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }

    setDragging(false);
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    updateFile(nextFile);
  }

  function removeFile() {
    updateFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      {label ? <FormLabel htmlFor={inputId}>{label}</FormLabel> : null}

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "group flex w-full cursor-pointer flex-col gap-3 rounded-lg border border-dashed bg-white dark:bg-slate-900 p-4 text-left shadow-xs transition duration-200",
          "focus-within:ring-2",
          fieldColorClasses[color].focusWithin,
          dragging ? fieldColorClasses[color].soft : "border-slate-300 hover:border-slate-400",
          disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300",
          error && "border-rose-400 focus-within:ring-rose-100",
          className,
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? descriptionId : undefined}
        />

        <div className="flex items-center gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition", fieldColorClasses[color].soft)}>
            <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{placeholder}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Single file only</p>
          </div>
        </div>

        {selectedFileMeta ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <DocumentTextIcon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <span className="truncate">{selectedFileMeta}</span>
              </div>
            </div>

            {!disabled ? (
              <Button
                type="button"
                variant="ghost"
                color={color}
                size="sm"
                className="h-8 px-2"
                onClick={(event) => {
                  event.preventDefault();
                  removeFile();
                }}
                aria-label="Remove file"
              >
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </label>

      {error ? (
        <FormError id={descriptionId} message={error} />
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
