"use client";

import {
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  useId,
  useRef,
  useState,
} from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type DropzoneProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  helperText?: string;
  error?: string;
  color?: UIColor;
  className?: string;
  onFilesSelected: (files: File[]) => void;
};

export function Dropzone({
  accept,
  multiple = false,
  disabled = false,
  loading = false,
  helperText,
  error,
  color = "slate",
  className,
  onFilesSelected,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedId = useId();
  const inputId = `dropzone-${generatedId}`;
  const descriptionId = `${inputId}-description`;

  const [dragOver, setDragOver] = useState(false);

  const isDisabled = disabled || loading;

  function emitFiles(files: FileList | null) {
    if (!files || files.length === 0 || isDisabled) {
      return;
    }

    onFilesSelected(Array.from(files));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    emitFiles(event.target.files);

    if (event.target) {
      event.target.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);

    emitFiles(event.dataTransfer.files);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isDisabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!isDisabled) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (!isDisabled) {
            setDragOver(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        aria-disabled={isDisabled}
        aria-describedby={error || helperText ? descriptionId : undefined}
        className={cn(
          "group rounded-lg border border-dashed bg-white dark:bg-slate-900 p-5 shadow-xs transition",
          "focus-visible:outline-none focus-visible:ring-2",
          fieldColorClasses[color].focusVisible,
          dragOver
            ? fieldColorClasses[color].soft
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/70",
          isDisabled && "cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
          error && "border-rose-300 focus-visible:ring-rose-200",
          className,
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={isDisabled}
          onChange={handleInputChange}
        />

        <div className="flex items-center gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition", fieldColorClasses[color].soft)}>
            {loading ? (
              <DocumentArrowUpIcon className="h-5 w-5 animate-pulse" aria-hidden="true" />
            ) : (
              <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {loading ? "Memproses file..." : "Drag & drop file di sini atau klik untuk browse"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {multiple ? "Mendukung multiple file" : "Single file"}
              {accept ? ` • Accept: ${accept}` : ""}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p id={descriptionId} className="text-sm text-rose-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
