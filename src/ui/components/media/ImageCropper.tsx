"use client";

import {
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/ui/components/common";
import { cn } from "@/ui/utils/cn";
import { createObjectPreview, revokeObjectPreview } from "@/ui/utils/file";

type CropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originOffset: Point;
};

type OffsetBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export type ImageCropperProps = {
  image: File | string;
  aspectRatio?: number;
  outputType?: "image/jpeg" | "image/png" | "image/webp";
  outputQuality?: number;
  onCancel?: () => void;
  onCrop: (file: File) => void;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createDefaultCropBox(
  width: number,
  height: number,
  aspectRatio?: number,
): CropBox {
  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const targetWidth = width * 0.75;
  const targetHeight = height * 0.75;

  let cropWidth = targetWidth;
  let cropHeight = targetHeight;

  if (aspectRatio && aspectRatio > 0) {
    if (targetWidth / targetHeight > aspectRatio) {
      cropHeight = targetHeight;
      cropWidth = cropHeight * aspectRatio;
    } else {
      cropWidth = targetWidth;
      cropHeight = cropWidth / aspectRatio;
    }
  }

  if (cropWidth > width) {
    cropWidth = width;
  }

  if (cropHeight > height) {
    cropHeight = height;
  }

  return {
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

function getFileName(image: File | string, outputType: string) {
  const extension =
    outputType === "image/png"
      ? "png"
      : outputType === "image/webp"
        ? "webp"
        : "jpg";

  if (typeof image === "string") {
    return `cropped-image.${extension}`;
  }

  const base = image.name.replace(/\.[^./]+$/, "");
  return `${base}-cropped.${extension}`;
}

function getOffsetBounds(
  zoom: number,
  cropBox: CropBox,
  viewportSize: Size,
): OffsetBounds {
  const scaledWidth = viewportSize.width * zoom;
  const scaledHeight = viewportSize.height * zoom;

  const baseLeft = (viewportSize.width - scaledWidth) / 2;
  const baseTop = (viewportSize.height - scaledHeight) / 2;

  return {
    minX: cropBox.x + cropBox.width - scaledWidth - baseLeft,
    maxX: cropBox.x - baseLeft,
    minY: cropBox.y + cropBox.height - scaledHeight - baseTop,
    maxY: cropBox.y - baseTop,
  };
}

function clampOffset(
  nextOffset: Point,
  zoom: number,
  cropBox: CropBox,
  viewportSize: Size,
): Point {
  if (viewportSize.width <= 0 || viewportSize.height <= 0) {
    return { x: 0, y: 0 };
  }

  const bounds = getOffsetBounds(zoom, cropBox, viewportSize);

  const minX = Math.min(bounds.minX, bounds.maxX);
  const maxX = Math.max(bounds.minX, bounds.maxX);
  const minY = Math.min(bounds.minY, bounds.maxY);
  const maxY = Math.max(bounds.minY, bounds.maxY);

  return {
    x: clamp(nextOffset.x, minX, maxX),
    y: clamp(nextOffset.y, minY, maxY),
  };
}

export function ImageCropper({
  image,
  aspectRatio = 1,
  outputType = "image/jpeg",
  outputQuality = 0.9,
  onCancel,
  onCrop,
  className,
}: ImageCropperProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const [objectUrl, setObjectUrl] = useState("");
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState<Size>({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceUrl = typeof image === "string" ? image : objectUrl;
  const imageReady = loadedSource === sourceUrl && viewportSize.width > 0 && viewportSize.height > 0;

  useEffect(() => {
    if (typeof image === "string") {
      return;
    }

    const nextObjectUrl = createObjectPreview(image);
    const timer = window.setTimeout(() => {
      setObjectUrl(nextObjectUrl);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      revokeObjectPreview(nextObjectUrl);
    };
  }, [image]);

  useEffect(() => {
    function handlePointerMove(event: globalThis.PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId || !imageReady) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;

      const nextOffset = {
        x: dragState.originOffset.x + deltaX,
        y: dragState.originOffset.y + deltaY,
      };

      setOffset(clampOffset(nextOffset, zoom, cropBox, viewportSize));
    }

    function handlePointerUp(event: globalThis.PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [cropBox, imageReady, viewportSize, zoom]);

  function handleZoomChange(nextZoom: number) {
    const normalizedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    setZoom(normalizedZoom);
    setOffset((currentOffset) =>
      clampOffset(currentOffset, normalizedZoom, cropBox, viewportSize),
    );
  }

  function resetCropBox() {
    if (!viewportSize.width || !viewportSize.height) {
      return;
    }

    const nextCropBox = createDefaultCropBox(
      viewportSize.width,
      viewportSize.height,
      aspectRatio,
    );

    setCropBox(nextCropBox);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setError(null);
  }

  function handleImageLoad() {
    const imgNode = imageRef.current;

    if (!imgNode) {
      return;
    }

    const width = imgNode.clientWidth;
    const height = imgNode.clientHeight;

    if (!width || !height) {
      return;
    }

    const nextCropBox = createDefaultCropBox(width, height, aspectRatio);

    setLoadedSource(sourceUrl);
    setViewportSize({ width, height });
    setCropBox(nextCropBox);
    setZoom(MIN_ZOOM);
    setOffset({ x: 0, y: 0 });
    setError(null);
  }

  function handleCropPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!imageReady) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originOffset: offset,
    };
  }

  async function applyCrop() {
    const imgNode = imageRef.current;

    if (!imgNode || !imageReady) {
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const renderWidth = viewportSize.width;
      const renderHeight = viewportSize.height;
      const naturalWidth = imgNode.naturalWidth;
      const naturalHeight = imgNode.naturalHeight;

      if (!renderWidth || !renderHeight || !naturalWidth || !naturalHeight) {
        setError("Gambar belum siap untuk dicrop.");
        return;
      }

      const scaleX = naturalWidth / renderWidth;
      const scaleY = naturalHeight / renderHeight;

      const sourceX =
        (((cropBox.x - offset.x - renderWidth / 2) / zoom) + renderWidth / 2) * scaleX;
      const sourceY =
        (((cropBox.y - offset.y - renderHeight / 2) / zoom) + renderHeight / 2) * scaleY;

      const sourceWidth = Math.max(1, (cropBox.width * scaleX) / zoom);
      const sourceHeight = Math.max(1, (cropBox.height * scaleY) / zoom);

      const clampedSourceX = clamp(sourceX, 0, naturalWidth - sourceWidth);
      const clampedSourceY = clamp(sourceY, 0, naturalHeight - sourceHeight);

      const outputWidth = Math.max(1, Math.round(sourceWidth));
      const outputHeight = Math.max(1, Math.round(sourceHeight));

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Canvas context tidak tersedia.");
        return;
      }

      context.drawImage(
        imgNode,
        clampedSourceX,
        clampedSourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputType, outputQuality);
      });

      if (!blob) {
        setError("Gagal menghasilkan hasil crop.");
        return;
      }

      const nextFile = new File([blob], getFileName(image, outputType), {
        type: outputType,
      });

      onCrop(nextFile);
    } finally {
      setIsApplying(false);
    }
  }

  const zoomPercentage = useMemo(() => Math.round(zoom * 100), [zoom]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Drag area crop untuk mengatur posisi gambar.</span>
          <span>Zoom: {zoomPercentage}%</span>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950/90 p-3">
          {sourceUrl ? (
            <div className="relative mx-auto w-full overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element -- Canvas crop needs direct access to the source image node. */}
              <img
                ref={imageRef}
                src={sourceUrl}
                alt="Crop source"
                className="max-h-[420px] w-full select-none object-contain will-change-transform"
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                onLoad={handleImageLoad}
              />

              {imageReady ? (
                <div
                  className="absolute border-2 border-sky-400"
                  style={{
                    left: cropBox.x,
                    top: cropBox.y,
                    width: cropBox.width,
                    height: cropBox.height,
                    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.52)",
                  }}
                  onPointerDown={handleCropPointerDown}
                >
                  <div className="absolute left-1 top-1 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Drag
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 animate-pulse bg-slate-800/40" aria-hidden="true" />
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="cropper-zoom" className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Zoom
        </label>
        <input
          id="cropper-zoom"
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          value={zoom}
          onChange={(event) => handleZoomChange(Number(event.target.value))}
          disabled={!imageReady}
          aria-label="Image cropper zoom"
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
            Batal
          </Button>
        ) : null}

        <Button type="button" variant="outline" onClick={resetCropBox}>
          <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>

        <Button
          type="button"
          onClick={applyCrop}
          isLoading={isApplying}
          disabled={!imageReady || isApplying}
        >
          {!isApplying ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : null}
          Terapkan Crop
        </Button>
      </div>
    </div>
  );
}
