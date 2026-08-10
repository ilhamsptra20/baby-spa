const DEFAULT_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 0) {
    return "0 B";
  }

  if (size === 0) {
    return "0 B";
  }

  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    DEFAULT_UNITS.length - 1,
  );

  const normalizedSize = size / 1024 ** unitIndex;
  const decimals = normalizedSize >= 10 || unitIndex === 0 ? 0 : 1;

  return `${normalizedSize.toFixed(decimals)} ${DEFAULT_UNITS[unitIndex]}`;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function validateFileSize(file: File, maxSize?: number): string | null {
  if (!maxSize || maxSize <= 0) {
    return null;
  }

  if (file.size > maxSize) {
    return `Ukuran file melebihi batas ${formatFileSize(maxSize)}.`;
  }

  return null;
}

export function validateFileType(file: File, acceptedTypes?: string[]): string | null {
  if (!acceptedTypes || acceptedTypes.length === 0) {
    return null;
  }

  const normalized = acceptedTypes.map((item) => item.trim()).filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const matches = normalized.some((acceptedType) => {
    const lowerType = acceptedType.toLowerCase();

    if (lowerType === "*/*") {
      return true;
    }

    if (lowerType.startsWith(".")) {
      return fileName.endsWith(lowerType);
    }

    if (lowerType.endsWith("/*")) {
      const mimePrefix = lowerType.slice(0, -1);
      return fileType.startsWith(mimePrefix);
    }

    return fileType === lowerType;
  });

  if (!matches) {
    return "Tipe file tidak didukung.";
  }

  return null;
}

export function createObjectPreview(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectPreview(url?: string): void {
  if (!url) {
    return;
  }

  URL.revokeObjectURL(url);
}
