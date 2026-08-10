"use client";

import type { UploadedFile } from "@/ui/types/upload";

import {
  ImageUpload,
  type ImageUploadProps,
} from "./ImageUpload";

export type GalleryUploadProps = Omit<
  ImageUploadProps,
  "value" | "onChange" | "multiple" | "acceptedTypes" | "previewRatio"
> & {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
};

export function GalleryUpload({
  value,
  onChange,
  label = "Gallery Images",
  helperText = "Tambahkan beberapa gambar untuk galeri produk/properti.",
  maxFiles = 12,
  crop = false,
  ...props
}: GalleryUploadProps) {
  return (
    <ImageUpload
      {...props}
      label={label}
      helperText={helperText}
      value={value}
      onChange={onChange}
      multiple
      maxFiles={maxFiles}
      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
      crop={crop}
      previewRatio="square"
    />
  );
}
