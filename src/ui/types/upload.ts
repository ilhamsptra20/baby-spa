export type UploadStatus =
  | "idle"
  | "preview"
  | "uploading"
  | "success"
  | "error";

export type UploadedFile = {
  id?: string;
  file?: File;
  name: string;
  url?: string;
  previewUrl?: string;
  key?: string;
  mimeType?: string;
  size?: number;
  status?: UploadStatus;
  progress?: number;
  error?: string;
};

export type UploadResult = {
  url: string;
  key?: string;
  name?: string;
  mimeType?: string;
  size?: number;
};
