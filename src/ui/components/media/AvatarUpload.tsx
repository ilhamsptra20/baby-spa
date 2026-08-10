"use client";

import type { UploadedFile } from "@/ui/types/upload";

import {
  ImageUpload,
  type ImageUploadProps,
} from "./ImageUpload";

export type AvatarUploadProps = Omit<
  ImageUploadProps,
  | "value"
  | "onChange"
  | "multiple"
  | "maxFiles"
  | "acceptedTypes"
  | "cropAspectRatio"
  | "previewRatio"
  | "previewRounded"
> & {
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  circle?: boolean;
};

export function AvatarUpload({
  value,
  onChange,
  label = "Avatar",
  helperText = "Gunakan gambar square agar hasil crop optimal.",
  crop = true,
  circle = true,
  ...props
}: AvatarUploadProps) {
  return (
    <ImageUpload
      {...props}
      label={label}
      helperText={helperText}
      value={value ? [value] : []}
      onChange={(files) => onChange?.(files[0] ?? null)}
      multiple={false}
      maxFiles={1}
      acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
      crop={crop}
      cropAspectRatio={1}
      previewRatio="square"
      previewRounded={circle ? "full" : "md"}
    />
  );
}
