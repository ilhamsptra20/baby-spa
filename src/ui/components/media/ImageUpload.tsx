"use client";

import {
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button, ScrollArea } from "@/ui/components/common";
import { FormLabel } from "@/ui/components/form";
import { Modal } from "@/ui/components/overlay";
import type { UIColor } from "@/ui/types/color";
import type { UploadResult, UploadedFile } from "@/ui/types/upload";
import { cn } from "@/ui/utils/cn";
import {
  createObjectPreview,
  isImageFile,
  revokeObjectPreview,
  validateFileSize,
  validateFileType,
} from "@/ui/utils/file";

import { Dropzone } from "./Dropzone";
import { FilePreviewCard } from "./FilePreviewCard";
import { ImageCropper } from "./ImageCropper";
import { ImagePreview, type ImagePreviewRatio } from "./ImagePreview";

type CropRequest = {
  file: File;
  resolver: (file: File | null) => void;
};

type UploadApiResponse = {
  status?: boolean;
  message?: string;
  data?: UploadResult;
};

function createUploadId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type ImageUploadProps = {
  label?: string;
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;

  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];

  crop?: boolean;
  cropAspectRatio?: number;

  uploadUrl?: string;
  uploadHeaders?: Record<string, string>;
  uploadFieldName?: string;
  uploadMethod?: "POST" | "PUT";

  uploadImage?: (file: File) => Promise<UploadResult>;

  disabled?: boolean;
  helperText?: string;
  error?: string;
  color?: UIColor;
  className?: string;
  showPreview?: boolean;
  previewRatio?: ImagePreviewRatio;
  previewRounded?: "md" | "full";
};

export function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
  maxFiles = multiple ? 10 : 1,
  maxSize,
  acceptedTypes = ["image/*"],
  crop = false,
  cropAspectRatio = 1,
  uploadUrl,
  uploadHeaders,
  uploadFieldName = "file",
  uploadMethod = "POST",
  uploadImage,
  disabled = false,
  helperText,
  error,
  color = "slate",
  className,
  showPreview = true,
  previewRatio,
  previewRounded = "md",
}: ImageUploadProps) {
  const isControlled = value !== undefined;
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>(value ?? []);
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const files = isControlled ? value ?? [] : internalFiles;
  const filesRef = useRef<UploadedFile[]>(files);
  const ownedPreviewUrlsRef = useRef<Set<string>>(new Set());
  filesRef.current = files;

  useEffect(() => {
    const ownedPreviews = ownedPreviewUrlsRef.current;

    return () => {
      for (const url of ownedPreviews) {
        revokeObjectPreview(url);
      }

      ownedPreviews.clear();
    };
  }, []);

  const hasUploader = Boolean(uploadImage || uploadUrl);

  const acceptedString = useMemo(() => acceptedTypes.join(","), [acceptedTypes]);

  function emitFiles(nextFiles: UploadedFile[]) {
    filesRef.current = nextFiles;

    if (!isControlled) {
      setInternalFiles(nextFiles);
    }

    onChange?.(nextFiles);
  }

  function rememberOwnedPreview(url?: string) {
    if (!url || !url.startsWith("blob:")) {
      return;
    }

    ownedPreviewUrlsRef.current.add(url);
  }

  function releaseOwnedPreview(url?: string) {
    if (!url || !ownedPreviewUrlsRef.current.has(url)) {
      return;
    }

    revokeObjectPreview(url);
    ownedPreviewUrlsRef.current.delete(url);
  }

  function upsertFile(targetId: string, updater: (current: UploadedFile) => UploadedFile) {
    const nextFiles = filesRef.current.map((entry) =>
      entry.id === targetId ? updater(entry) : entry,
    );

    emitFiles(nextFiles);
  }

  function appendFile(entry: UploadedFile) {
    if (multiple) {
      emitFiles([...filesRef.current, entry]);
      return;
    }

    const current = filesRef.current[0];
    emitFiles([entry]);

    if (current?.previewUrl) {
      window.setTimeout(() => {
        releaseOwnedPreview(current.previewUrl);
      }, 0);
    }
  }

  function removeFile(fileId?: string) {
    if (!fileId) {
      return;
    }

    const target = filesRef.current.find((entry) => entry.id === fileId);

    emitFiles(filesRef.current.filter((entry) => entry.id !== fileId));

    if (target?.previewUrl) {
      window.setTimeout(() => {
        releaseOwnedPreview(target.previewUrl);
      }, 0);
    }
  }

  function removeAll() {
    const previewUrls = filesRef.current.map((entry) => entry.previewUrl);
    emitFiles([]);

    window.setTimeout(() => {
      for (const previewUrl of previewUrls) {
        releaseOwnedPreview(previewUrl);
      }
    }, 0);
  }

  async function uploadWithEndpoint(file: File): Promise<UploadResult> {
    if (!uploadUrl) {
      throw new Error("Upload URL belum tersedia.");
    }

    const formData = new FormData();
    formData.append(uploadFieldName, file);

    const response = await fetch(uploadUrl, {
      method: uploadMethod,
      headers: uploadHeaders,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload gagal dengan status ${response.status}.`);
    }

    const result = (await response.json()) as UploadApiResponse;
    const uploaded = result.data;

    if (!uploaded?.url) {
      throw new Error(result.message || "Upload response tidak mengandung data.url.");
    }

    return uploaded;
  }

  async function performUpload(file: File): Promise<UploadResult | null> {
    if (uploadImage) {
      return uploadImage(file);
    }

    if (uploadUrl) {
      return uploadWithEndpoint(file);
    }

    return null;
  }

  function requestCrop(file: File): Promise<File | null> {
    return new Promise((resolve) => {
      setCropRequest({
        file,
        resolver: resolve,
      });
    });
  }

  function resolveCrop(result: File | null) {
    setCropRequest((current) => {
      if (!current) {
        return null;
      }

      current.resolver(result);
      return null;
    });
  }

  async function processFile(rawFile: File) {
    const typeError = validateFileType(rawFile, acceptedTypes);
    if (typeError) {
      setLocalError(typeError);
      return;
    }

    const sizeError = validateFileSize(rawFile, maxSize);
    if (sizeError) {
      setLocalError(sizeError);
      return;
    }

    setLocalError(null);

    let nextFile = rawFile;

    if (crop && isImageFile(rawFile)) {
      const cropped = await requestCrop(rawFile);
      if (!cropped) {
        return;
      }

      nextFile = cropped;
    }

    const entryId = createUploadId();
    const previewUrl = isImageFile(nextFile) ? createObjectPreview(nextFile) : undefined;

    rememberOwnedPreview(previewUrl);

    const draft: UploadedFile = {
      id: entryId,
      file: nextFile,
      name: nextFile.name,
      previewUrl,
      mimeType: nextFile.type,
      size: nextFile.size,
      status: hasUploader ? "uploading" : "preview",
      progress: hasUploader ? 15 : 0,
    };

    appendFile(draft);

    if (!hasUploader) {
      return;
    }

    upsertFile(entryId, (current) => ({
      ...current,
      status: "uploading",
      progress: 35,
      error: undefined,
    }));

    try {
      const uploaded = await performUpload(nextFile);

      if (!uploaded) {
        upsertFile(entryId, (current) => ({
          ...current,
          status: "preview",
          progress: 0,
        }));
        return;
      }

      upsertFile(entryId, (current) => ({
        ...current,
        status: "success",
        progress: 100,
        url: uploaded.url,
        key: uploaded.key,
        name: uploaded.name ?? current.name,
        mimeType: uploaded.mimeType ?? current.mimeType,
        size: uploaded.size ?? current.size,
        error: undefined,
      }));
    } catch (uploadError) {
      upsertFile(entryId, (current) => ({
        ...current,
        status: "error",
        progress: 0,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Upload gagal. Coba lagi.",
      }));
    }
  }

  async function handleFilesSelected(selectedFiles: File[]) {
    if (disabled || selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = Math.max(0, maxFiles - filesRef.current.length);
    if (remainingSlots <= 0) {
      setLocalError(`Maksimal ${maxFiles} file.`);
      return;
    }

    const nextBatch = multiple
      ? selectedFiles.slice(0, remainingSlots)
      : selectedFiles.slice(0, 1);

    for (const file of nextBatch) {
      // Process sequentially so crop modal flow remains predictable.
      await processFile(file);
    }
  }

  async function retryUpload(entry: UploadedFile) {
    if (!entry.file) {
      return;
    }

    upsertFile(entry.id ?? "", (current) => ({
      ...current,
      status: "uploading",
      progress: 20,
      error: undefined,
    }));

    try {
      const uploaded = await performUpload(entry.file);

      if (!uploaded) {
        upsertFile(entry.id ?? "", (current) => ({
          ...current,
          status: "preview",
          progress: 0,
        }));
        return;
      }

      upsertFile(entry.id ?? "", (current) => ({
        ...current,
        status: "success",
        progress: 100,
        url: uploaded.url,
        key: uploaded.key,
        name: uploaded.name ?? current.name,
        mimeType: uploaded.mimeType ?? current.mimeType,
        size: uploaded.size ?? current.size,
        error: undefined,
      }));
    } catch (uploadError) {
      upsertFile(entry.id ?? "", (current) => ({
        ...current,
        status: "error",
        progress: 0,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Upload gagal. Coba lagi.",
      }));
    }
  }

  async function recropImage(entry: UploadedFile) {
    if (!entry.file || !isImageFile(entry.file) || disabled) {
      return;
    }

    const cropped = await requestCrop(entry.file);
    if (!cropped) {
      return;
    }

    const newPreviewUrl = createObjectPreview(cropped);
    rememberOwnedPreview(newPreviewUrl);
    const previousPreviewUrl = entry.previewUrl;

    upsertFile(entry.id ?? "", (current) => ({
      ...current,
      file: cropped,
      name: cropped.name,
      previewUrl: newPreviewUrl,
      mimeType: cropped.type,
      size: cropped.size,
      status: hasUploader ? "uploading" : "preview",
      progress: hasUploader ? 15 : 0,
      error: undefined,
    }));

    if (previousPreviewUrl) {
      window.setTimeout(() => {
        releaseOwnedPreview(previousPreviewUrl);
      }, 0);
    }

    if (!hasUploader) {
      return;
    }

    try {
      const uploaded = await performUpload(cropped);

      if (!uploaded) {
        upsertFile(entry.id ?? "", (current) => ({
          ...current,
          status: "preview",
          progress: 0,
        }));
        return;
      }

      upsertFile(entry.id ?? "", (current) => ({
        ...current,
        status: "success",
        progress: 100,
        url: uploaded.url,
        key: uploaded.key,
        name: uploaded.name ?? current.name,
        mimeType: uploaded.mimeType ?? current.mimeType,
        size: uploaded.size ?? current.size,
        error: undefined,
      }));
    } catch (uploadError) {
      upsertFile(entry.id ?? "", (current) => ({
        ...current,
        status: "error",
        progress: 0,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Upload gagal. Coba lagi.",
      }));
    }
  }

  const resolvedError = error ?? localError;
  const resolvedPreviewRatio =
    previewRatio ?? (multiple ? "square" : "banner");

  const remainingLabel =
    maxFiles > 0 ? `Sisa slot: ${Math.max(0, maxFiles - files.length)}` : undefined;

  const imageEntries = files.filter((entry) => entry.mimeType?.startsWith("image/"));
  const otherEntries = files.filter((entry) => !entry.mimeType?.startsWith("image/"));

  return (
    <div className={cn("space-y-3", className)}>
      {label ? <FormLabel>{label}</FormLabel> : null}

      <Dropzone
        accept={acceptedString}
        multiple={multiple}
        disabled={disabled}
        loading={false}
        error={resolvedError ?? undefined}
        helperText={helperText ?? remainingLabel}
        color={color}
        onFilesSelected={handleFilesSelected}
      />

      {files.length > 0 ? (
        <div className="space-y-3">
          {showPreview && imageEntries.length > 0 ? (
            <ScrollArea className="pr-1" viewportClassName="max-h-[28rem]" fadeEdges hideScrollbarUntilHover>
              <div
                className={cn(
                  "grid gap-3",
                  multiple
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1 max-w-xs",
                )}
              >
                {imageEntries.map((entry) => (
                  <div key={entry.id} className="space-y-2">
                    <ImagePreview
                      ratio={resolvedPreviewRatio}
                      rounded={previewRounded}
                      url={entry.url}
                      previewUrl={entry.previewUrl}
                      loading={entry.status === "uploading"}
                      error={entry.status === "error" ? entry.error : undefined}
                      disabled={disabled}
                      onRemove={disabled ? undefined : () => removeFile(entry.id)}
                      onEdit={
                        disabled || !crop || !entry.file ? undefined : () => {
                          void recropImage(entry);
                        }
                      }
                    />

                    <div className="space-y-1">
                      <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{entry.name}</p>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                            entry.status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : entry.status === "error"
                                ? "bg-rose-100 text-rose-700"
                                : entry.status === "uploading"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
                          )}
                        >
                          {entry.status ?? "idle"}
                        </span>

                        {entry.status === "uploading" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <ArrowPathIcon className="h-3 w-3 animate-spin" aria-hidden="true" />
                            {Math.round(entry.progress ?? 0)}%
                          </span>
                        ) : null}

                        {entry.status === "error" && entry.file && hasUploader && !disabled ? (
                          <button
                            type="button"
                            className="text-[11px] font-medium text-slate-600 dark:text-slate-300 transition hover:text-slate-900 dark:text-slate-100"
                            onClick={() => {
                              void retryUpload(entry);
                            }}
                          >
                            Retry
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : null}

          {otherEntries.length > 0 ? (
            <ScrollArea className="pr-1" viewportClassName="max-h-72" fadeEdges hideScrollbarUntilHover>
              <div className="space-y-2">
                {otherEntries.map((entry) => (
                  <FilePreviewCard
                    key={entry.id}
                    file={entry}
                    disabled={disabled}
                    onRemove={disabled ? undefined : () => removeFile(entry.id)}
                    onRetry={
                      entry.file && hasUploader && !disabled
                        ? () => {
                          void retryUpload(entry);
                        }
                        : undefined
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">{files.length} file dipilih</p>
            {!disabled && files.length > 0 ? (
              <Button type="button" size="sm" variant="ghost" color={color} onClick={removeAll}>
                Hapus semua
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {resolvedError ? (
        <p className="inline-flex items-start gap-1.5 text-sm text-rose-600">
          <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {resolvedError}
        </p>
      ) : null}

      <Modal
        open={Boolean(cropRequest)}
        onClose={() => resolveCrop(null)}
        title="Crop image"
        description="Sesuaikan area gambar sebelum dilanjutkan."
        className="max-w-3xl"
        footer={null}
      >
        {cropRequest ? (
          <ImageCropper
            image={cropRequest.file}
            aspectRatio={cropAspectRatio}
            onCancel={() => resolveCrop(null)}
            onCrop={(file) => resolveCrop(file)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
