"use client";

import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  ListBulletIcon,
  PaperClipIcon,
  PhotoIcon,
  QueueListIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FormField } from "@/ui/components/form/FormField";
import { cn } from "@/ui/utils/cn";

type EditorFormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  link: boolean;
};

type UploadTarget = "image" | "file";

type EditorUploadMode = "base64" | "storage";

type UploadStrategy = "base64" | "storage" | "disabled";

type UploadAvailability = {
  mode: EditorUploadMode;
  canUploadImage: boolean;
  canUploadFile: boolean;
  shouldFallbackToBase64: boolean;
  allowBase64Insert: boolean;
  imageStrategy: UploadStrategy;
  fileStrategy: UploadStrategy;
  imageUploadUrl?: string;
  fileUploadUrl?: string;
  imageDisabledReason?: string;
  fileDisabledReason?: string;
  warning?: string;
};

type StorageUploadResponse = {
  status?: boolean;
  message?: string;
  data?: {
    url?: string;
    key?: string;
    name?: string;
    mimeType?: string;
    size?: number;
  };
};

const DEFAULT_FORMAT_STATE: EditorFormatState = {
  bold: false,
  italic: false,
  underline: false,
  unorderedList: false,
  orderedList: false,
  link: false,
};

const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BR",
  "DIV",
  "EM",
  "I",
  "IMG",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "U",
  "UL",
]);

const DATA_IMAGE_PATTERN = /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i;
const DATA_FILE_PATTERN = /^data:[a-z0-9.+-]+\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i;

export type TextEditorProps = {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  className?: string;
};

function unwrapElement(element: Element) {
  const parent = element.parentNode;

  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
}

function sanitizeUrl(
  rawUrl: string,
  options: {
    allowDataMedia: boolean;
    forImage?: boolean;
  } = {
    allowDataMedia: false,
  },
) {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return "";
  }

  if (/^(javascript|vbscript):/i.test(trimmed)) {
    return "";
  }

  if (/^data:/i.test(trimmed)) {
    if (!options.allowDataMedia) {
      return "";
    }

    if (options.forImage) {
      return DATA_IMAGE_PATTERN.test(trimmed) ? trimmed : "";
    }

    return DATA_FILE_PATTERN.test(trimmed) ? trimmed : "";
  }

  const hasProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);

  if (!hasProtocol) {
    return trimmed;
  }

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return "";
}

function escapeHtml(rawText: string) {
  return rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHtml(rawHtml: string, allowDataMedia: boolean) {
  if (!rawHtml) {
    return "";
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${rawHtml}</div>`, "text/html");
  const root = parsed.body.firstElementChild as HTMLDivElement | null;

  if (!root) {
    return "";
  }

  root
    .querySelectorAll("script, style, iframe, object, embed, meta, link")
    .forEach((node) => node.remove());

  const elements = Array.from(root.querySelectorAll("*"));

  elements.forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      unwrapElement(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();

      if (attributeName.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (element.tagName === "A" && ["href", "target", "rel"].includes(attributeName)) {
        return;
      }

      if (element.tagName === "IMG" && ["src", "alt", "title"].includes(attributeName)) {
        return;
      }

      element.removeAttribute(attribute.name);
    });

    if (element.tagName === "A") {
      const href = sanitizeUrl(element.getAttribute("href") ?? "", {
        allowDataMedia,
      });

      if (!href) {
        unwrapElement(element);
        return;
      }

      element.setAttribute("href", href);
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }

    if (element.tagName === "IMG") {
      const src = sanitizeUrl(element.getAttribute("src") ?? "", {
        allowDataMedia,
        forImage: true,
      });

      if (!src) {
        element.remove();
        return;
      }

      element.setAttribute("src", src);
      if (!element.getAttribute("alt")) {
        element.setAttribute("alt", "image");
      }
    }
  });

  const sanitized = root.innerHTML
    .replace(/<br\s*\/?\s*>/gi, "<br>")
    .replace(/&nbsp;/gi, " ")
    .trim();

  if (["<br>", "<div><br></div>", "<p><br></p>"].includes(sanitized)) {
    return "";
  }

  return sanitized;
}

function toCssSize(value?: number | string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

function hasMeaningfulText(node: HTMLDivElement | null) {
  if (!node) {
    return true;
  }

  return (node.textContent ?? "").replace(/\u00a0/g, " ").trim().length === 0;
}

function resolveUploadAvailability(): UploadAvailability {
  const rawMode = (process.env.NEXT_PUBLIC_EDITOR_UPLOAD_MODE ?? "").trim().toLowerCase();
  const mode: EditorUploadMode = rawMode === "storage" ? "storage" : "base64";
  const imageUploadUrl = (process.env.NEXT_PUBLIC_EDITOR_IMAGE_UPLOAD_URL ?? "").trim();
  const fileUploadUrl = (process.env.NEXT_PUBLIC_EDITOR_FILE_UPLOAD_URL ?? "").trim();
  const isProduction = process.env.NODE_ENV === "production";

  if (mode === "base64") {
    return {
      mode,
      canUploadImage: true,
      canUploadFile: true,
      shouldFallbackToBase64: false,
      allowBase64Insert: true,
      imageStrategy: "base64",
      fileStrategy: "base64",
      warning: isProduction
        ? undefined
        : "Editor upload mode saat ini base64. Untuk production, gunakan mode storage agar payload tetap ringan.",
    };
  }

  const imageStrategy: UploadStrategy = imageUploadUrl
    ? "storage"
    : isProduction
      ? "disabled"
      : "base64";

  const fileStrategy: UploadStrategy = fileUploadUrl
    ? "storage"
    : isProduction
      ? "disabled"
      : "base64";

  const missingAnyStorageEndpoint = !imageUploadUrl || !fileUploadUrl;

  return {
    mode,
    canUploadImage: imageStrategy !== "disabled",
    canUploadFile: fileStrategy !== "disabled",
    shouldFallbackToBase64: !isProduction && (imageStrategy === "base64" || fileStrategy === "base64"),
    allowBase64Insert: !isProduction && (imageStrategy === "base64" || fileStrategy === "base64"),
    imageStrategy,
    fileStrategy,
    imageUploadUrl: imageUploadUrl || undefined,
    fileUploadUrl: fileUploadUrl || undefined,
    imageDisabledReason:
      imageStrategy === "disabled"
        ? "Upload gambar dinonaktifkan: endpoint storage image belum dikonfigurasi."
        : undefined,
    fileDisabledReason:
      fileStrategy === "disabled"
        ? "Upload file dinonaktifkan: endpoint storage file belum dikonfigurasi."
        : undefined,
    warning: missingAnyStorageEndpoint
      ? isProduction
        ? "Upload media belum dikonfigurasi. Hubungi administrator atau atur endpoint upload storage."
        : "Storage upload URL belum diatur. Development fallback memakai base64."
      : undefined,
  };
}

async function uploadToStorage(file: File, uploadUrl: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  let body: StorageUploadResponse | null = null;

  try {
    body = (await response.json()) as StorageUploadResponse;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message ?? "Upload gagal. Silakan coba lagi.");
  }

  const url = body?.data?.url;

  if (!url) {
    throw new Error("Upload berhasil diproses, tetapi response tidak memiliki `data.url`.");
  }

  return url;
}

async function readFileAsDataUrl(file: File) {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const chunks: string[] = [];
    const chunkSize = 0x8000;

    for (let index = 0; index < bytes.length; index += chunkSize) {
      const slice = bytes.subarray(index, index + chunkSize);
      chunks.push(String.fromCharCode(...slice));
    }

    const mimeType = file.type || "application/octet-stream";
    return `data:${mimeType};base64,${btoa(chunks.join(""))}`;
  } catch {
    throw new Error("Gagal membaca file.");
  }
}

export function TextEditor({
  id,
  name,
  label,
  value = "",
  onChange,
  placeholder = "Tulis konten...",
  helperText,
  error,
  disabled = false,
  required = false,
  minHeight = 112,
  maxHeight,
  className,
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fieldId = id ?? name ?? "text-editor";
  const uploadConfig = useMemo(() => resolveUploadAvailability(), []);

  const [formatState, setFormatState] = useState<EditorFormatState>(DEFAULT_FORMAT_STATE);
  const [isEmpty, setIsEmpty] = useState(true);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const editorStyle = useMemo<CSSProperties>(
    () => ({
      minHeight: toCssSize(minHeight),
      maxHeight: toCssSize(maxHeight),
    }),
    [maxHeight, minHeight],
  );

  useEffect(() => {
    if (uploadConfig.mode !== "storage" || !uploadConfig.shouldFallbackToBase64) {
      return;
    }

    console.warn(
      "[TextEditor] Storage upload mode aktif tetapi endpoint upload belum lengkap. Development fallback menggunakan base64.",
    );
  }, [uploadConfig.mode, uploadConfig.shouldFallbackToBase64]);

  const refreshFormatState = useCallback(() => {
    const editor = editorRef.current;
    const selection = document.getSelection();
    const isSelectionInside = Boolean(
      editor && selection?.anchorNode && editor.contains(selection.anchorNode),
    );

    if (!isSelectionInside) {
      setFormatState(DEFAULT_FORMAT_STATE);
      return;
    }

    const getCommandState = (command: string) => {
      try {
        return document.queryCommandState(command);
      } catch {
        return false;
      }
    };

    setFormatState({
      bold: getCommandState("bold"),
      italic: getCommandState("italic"),
      underline: getCommandState("underline"),
      unorderedList: getCommandState("insertUnorderedList"),
      orderedList: getCommandState("insertOrderedList"),
      link: getCommandState("createLink"),
    });
  }, []);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const sanitized = sanitizeHtml(editor.innerHTML, uploadConfig.allowBase64Insert);

    if (editor.innerHTML !== sanitized) {
      editor.innerHTML = sanitized;
    }

    setIsEmpty(hasMeaningfulText(editor));
    onChange?.(sanitized);
    refreshFormatState();
  }, [onChange, refreshFormatState, uploadConfig.allowBase64Insert]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const safeValue = sanitizeHtml(value, uploadConfig.allowBase64Insert);

    if (sanitizeHtml(editor.innerHTML, uploadConfig.allowBase64Insert) !== safeValue) {
      editor.innerHTML = safeValue;
    }

    setIsEmpty(hasMeaningfulText(editor));
  }, [value, uploadConfig.allowBase64Insert]);

  useEffect(() => {
    function handleSelectionChange() {
      refreshFormatState();
    }

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [refreshFormatState]);

  function runCommand(command: string, commandValue?: string) {
    if (disabled) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function handleLinkAction() {
    if (disabled) {
      return;
    }

    const rawUrl = window.prompt("Masukkan URL", "https://");

    if (!rawUrl) {
      return;
    }

    const href = sanitizeUrl(rawUrl, {
      allowDataMedia: false,
    });

    if (!href) {
      setUploadError("URL tidak valid.");
      return;
    }

    const selection = document.getSelection();
    const hasSelection = Boolean(
      selection &&
        !selection.isCollapsed &&
        editorRef.current &&
        selection.anchorNode &&
        editorRef.current.contains(selection.anchorNode),
    );

    if (hasSelection) {
      runCommand("createLink", href);
      return;
    }

    runCommand(
      "insertHTML",
      `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(href)}</a>`,
    );
  }

  function handleClearFormatting() {
    if (disabled) {
      return;
    }

    editorRef.current?.focus();
    document.execCommand("removeFormat", false);
    document.execCommand("unlink", false);
    emitChange();
  }

  async function handleMediaInsert(target: UploadTarget, file: File) {
    setUploadError(null);

    const strategy = target === "image" ? uploadConfig.imageStrategy : uploadConfig.fileStrategy;

    if (strategy === "disabled") {
      setUploadError(
        target === "image"
          ? uploadConfig.imageDisabledReason ?? "Upload gambar tidak tersedia."
          : uploadConfig.fileDisabledReason ?? "Upload file tidak tersedia.",
      );
      return;
    }

    setUploadingTarget(target);

    try {
      let mediaUrl = "";

      if (strategy === "storage") {
        const uploadUrl = target === "image" ? uploadConfig.imageUploadUrl : uploadConfig.fileUploadUrl;

        if (!uploadUrl) {
          throw new Error("Endpoint upload belum dikonfigurasi.");
        }

        mediaUrl = await uploadToStorage(file, uploadUrl);
      } else {
        mediaUrl = await readFileAsDataUrl(file);
      }

      if (target === "image") {
        const safeSrc = sanitizeUrl(mediaUrl, {
          allowDataMedia: uploadConfig.allowBase64Insert,
          forImage: true,
        });

        if (!safeSrc) {
          throw new Error("URL gambar tidak valid atau tidak diizinkan.");
        }

        runCommand(
          "insertHTML",
          `<img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(file.name || "image")}" />`,
        );
      } else {
        const safeHref = sanitizeUrl(mediaUrl, {
          allowDataMedia: uploadConfig.allowBase64Insert,
          forImage: false,
        });

        if (!safeHref) {
          throw new Error("URL file tidak valid atau tidak diizinkan.");
        }

        runCommand(
          "insertHTML",
          `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(file.name)}</a>`,
        );
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Upload media gagal.";
      setUploadError(message);
    } finally {
      setUploadingTarget(null);
    }
  }

  async function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await handleMediaInsert("image", file);
  }

  async function handleAttachmentFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    await handleMediaInsert("file", file);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    if (disabled) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      const safeHtml = sanitizeHtml(html, uploadConfig.allowBase64Insert);
      document.execCommand("insertHTML", false, safeHtml || escapeHtml(text));
      emitChange();
      return;
    }

    document.execCommand("insertText", false, text);
    emitChange();
  }

  const toolbarButtonClass =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50";

  const imageUploadDisabled = disabled || !uploadConfig.canUploadImage || uploadingTarget !== null;
  const fileUploadDisabled = disabled || !uploadConfig.canUploadFile || uploadingTarget !== null;

  const imageUploadTitle = disabled
    ? "Editor dinonaktifkan"
    : uploadConfig.imageStrategy === "disabled"
      ? uploadConfig.imageDisabledReason ?? "Upload gambar tidak tersedia."
      : uploadConfig.imageStrategy === "base64" && uploadConfig.mode === "storage"
        ? "Development fallback: upload gambar disimpan sebagai base64."
        : "Upload gambar";

  const fileUploadTitle = disabled
    ? "Editor dinonaktifkan"
    : uploadConfig.fileStrategy === "disabled"
      ? uploadConfig.fileDisabledReason ?? "Upload file tidak tersedia."
      : uploadConfig.fileStrategy === "base64" && uploadConfig.mode === "storage"
        ? "Development fallback: upload file disimpan sebagai base64."
        : "Upload file";

  const configWarningVisible = Boolean(uploadConfig.warning && !dismissedWarning);

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      helperText={helperText}
      error={error}
      required={required}
    >
      {name && !disabled ? <input type="hidden" name={name} value={value} /> : null}
      <div
        className={cn(
          "rounded-md border border-slate-300 bg-white dark:bg-slate-900 shadow-xs transition duration-200",
          "focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200",
          disabled && "bg-slate-100 dark:bg-slate-800",
          error && "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-700 px-2 py-1.5">
          <button
            type="button"
            className={cn(toolbarButtonClass, formatState.bold && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("bold")}
            aria-label="Bold"
            disabled={disabled}
          >
            <span className="font-semibold">B</span>
          </button>
          <button
            type="button"
            className={cn(toolbarButtonClass, formatState.italic && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("italic")}
            aria-label="Italic"
            disabled={disabled}
          >
            <span className="italic">I</span>
          </button>
          <button
            type="button"
            className={cn(toolbarButtonClass, formatState.underline && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("underline")}
            aria-label="Underline"
            disabled={disabled}
          >
            <span className="underline">U</span>
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

          <button
            type="button"
            className={cn(
              toolbarButtonClass,
              formatState.unorderedList && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100",
            )}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("insertUnorderedList")}
            aria-label="Bullet list"
            disabled={disabled}
          >
            <ListBulletIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(toolbarButtonClass, formatState.orderedList && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand("insertOrderedList")}
            aria-label="Numbered list"
            disabled={disabled}
          >
            <QueueListIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

          <button
            type="button"
            className={cn(toolbarButtonClass, formatState.link && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleLinkAction}
            aria-label="Insert link"
            disabled={disabled}
          >
            <LinkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClearFormatting}
            aria-label="Clear formatting"
            disabled={disabled}
          >
            <XCircleIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />

          <button
            type="button"
            className={toolbarButtonClass}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => imageInputRef.current?.click()}
            aria-label="Upload image"
            disabled={imageUploadDisabled}
            title={imageUploadTitle}
          >
            {uploadingTarget === "image" ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PhotoIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload file"
            disabled={fileUploadDisabled}
            title={fileUploadTitle}
          >
            {uploadingTarget === "file" ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <PaperClipIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFileChange}
            disabled={imageUploadDisabled}
            tabIndex={-1}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachmentFileChange}
            disabled={fileUploadDisabled}
            tabIndex={-1}
          />
        </div>

        {configWarningVisible ? (
          <div className="mx-2 mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 leading-5">{uploadConfig.warning}</p>
            <button
              type="button"
              onClick={() => setDismissedWarning(true)}
              className="rounded p-0.5 text-amber-700 transition hover:bg-amber-100 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              aria-label="Dismiss upload warning"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {uploadError ? (
          <div className="mx-2 mt-2 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs text-rose-800">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="flex-1 leading-5">{uploadError}</p>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="rounded p-0.5 text-rose-700 transition hover:bg-rose-100 hover:text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              aria-label="Dismiss upload error"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="relative">
          {isEmpty ? (
            <p className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400 dark:text-slate-500">
              {placeholder}
            </p>
          ) : null}

          <div
            id={fieldId}
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-label={label ?? "Text editor"}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={() => emitChange()}
            onBlur={() => emitChange()}
            onPaste={handlePaste}
            style={editorStyle}
            className={cn(
              "w-full overflow-y-auto px-3 py-2 text-sm leading-6 text-slate-900 dark:text-slate-100 outline-none",
              disabled && "cursor-not-allowed text-slate-500 dark:text-slate-400",
            )}
          />
        </div>
      </div>
    </FormField>
  );
}
