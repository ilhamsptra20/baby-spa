"use client";

import {
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  DocumentIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import type { UploadedFile } from "@/ui/types/upload";
import { cn } from "@/ui/utils/cn";
import { formatFileSize } from "@/ui/utils/file";

export interface FilePreviewCardProps {
  file: UploadedFile;
  disabled?: boolean;
  className?: string;
  onRemove?: () => void;
  onRetry?: () => void;
}

function getFileExtension(name: string) {
  const parts = name.split(".");
  if (parts.length <= 1) {
    return "FILE";
  }

  return parts[parts.length - 1]?.toUpperCase() ?? "FILE";
}

function getStatusLabel(status?: UploadedFile["status"]) {
  if (!status || status === "idle") {
    return "Idle";
  }

  if (status === "preview") {
    return "Preview";
  }

  if (status === "uploading") {
    return "Uploading";
  }

  if (status === "success") {
    return "Uploaded";
  }

  return "Error";
}

function getStatusClass(status?: UploadedFile["status"]) {
  if (status === "success") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "error") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "uploading") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
}

export function FilePreviewCard({
  file,
  disabled = false,
  className,
  onRemove,
  onRetry,
}: FilePreviewCardProps) {
  const extension = getFileExtension(file.name);
  const size = typeof file.size === "number" ? formatFileSize(file.size) : "-";
  const statusLabel = getStatusLabel(file.status);
  const progress = Math.max(0, Math.min(100, Math.round(file.progress ?? 0)));

  const showRetry = file.status === "error" && Boolean(onRetry) && !disabled;
  const showRemove = Boolean(onRemove) && !disabled;

  return (
    <article
      className={cn(
        "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-xs transition hover:border-slate-300",
        disabled && "opacity-70",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {file.mimeType?.startsWith("text/") ? (
            <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <DocumentIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{file.name}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {extension} • {size}
            {file.mimeType ? ` • ${file.mimeType}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", getStatusClass(file.status))}>
              {statusLabel}
            </span>

            {file.error ? <span className="text-xs text-rose-600">{file.error}</span> : null}
          </div>
        </div>

        {(showRetry || showRemove) ? (
          <div className="flex shrink-0 items-center gap-1">
            {showRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="rounded p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                aria-label="Retry upload"
              >
                <ArrowPathRoundedSquareIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            {showRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                aria-label="Remove file"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {file.status === "uploading" ? (
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-slate-700 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Uploading... {progress}%
          </p>
        </div>
      ) : null}
    </article>
  );
}
