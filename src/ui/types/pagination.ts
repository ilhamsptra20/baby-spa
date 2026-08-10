export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<TData> {
  data: TData[];
  pagination: PaginationMeta;
}
