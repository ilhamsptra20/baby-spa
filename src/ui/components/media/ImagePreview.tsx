"use client";

import {
  PencilSquareIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { cn } from "@/ui/utils/cn";

export type ImagePreviewRatio = "square" | "video" | "banner" | "auto";

export interface ImagePreviewProps {
  url?: string;
  previewUrl?: string;
  alt?: string;
  ratio?: ImagePreviewRatio;
  rounded?: "md" | "full";
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  onRemove?: () => void;
  onEdit?: () => void;
}

const RATIO_CLASS_MAP: Record<ImagePreviewRatio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  banner: "aspect-[3/1]",
  auto: "min-h-32",
};

export function ImagePreview({
  url,
  previewUrl,
  alt = "Image preview",
  ratio = "square",
  rounded = "md",
  loading = false,
  disabled = false,
  error,
  className,
  onRemove,
  onEdit,
}: ImagePreviewProps) {
  const source = previewUrl ?? url;
  const [imageState, setImageState] = useState<{
    source?: string;
    loaded: boolean;
    failed: boolean;
  }>({
    source: undefined,
    loaded: false,
    failed: false,
  });

  const imageLoaded = imageState.source === source ? imageState.loaded : false;
  const imageFailed = imageState.source === source ? imageState.failed : false;

  const hasImage = Boolean(source) && !imageFailed;

  const showActions = useMemo(() => {
    return !disabled && (Boolean(onEdit) || Boolean(onRemove));
  }, [disabled, onEdit, onRemove]);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-xs",
          rounded === "full" ? "rounded-full" : "rounded-lg",
          RATIO_CLASS_MAP[ratio],
          disabled && "opacity-70",
        )}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Preview supports local object URLs before upload.
          <img
            src={source}
            alt={alt}
            className="h-full w-full object-cover"
            onLoad={() =>
              setImageState({
                source,
                loaded: true,
                failed: false,
              })
            }
            onError={() =>
              setImageState({
                source,
                loaded: false,
                failed: true,
              })
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-xs">
                <PhotoIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Belum ada gambar</p>
            </div>
          </div>
        )}

        {(loading || (hasImage && !imageLoaded)) ? (
          <div className="absolute inset-0 animate-pulse bg-slate-200/70" aria-hidden="true" />
        ) : null}

        {showActions ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-slate-900 dark:bg-slate-950/70 p-1 backdrop-blur-sm">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="rounded p-1 text-white transition hover:bg-white dark:bg-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Edit image"
              >
                <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded p-1 text-white transition hover:bg-white dark:bg-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Remove image"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
