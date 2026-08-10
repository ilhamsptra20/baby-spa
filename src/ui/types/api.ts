import type { PaginationMeta } from "@/ui/types/pagination";

export interface ApiSuccess<TData> {
  data: TData;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
}

export interface ApiListResponse<TData> {
  data: TData[];
  pagination: PaginationMeta;
  message?: string;
}
