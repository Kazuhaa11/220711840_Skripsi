export interface ApiResponse<TData = unknown> {
  success: boolean;
  message: string;
  data?: TData;
  errors?: Record<string, string[] | string>;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedApiData<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}

export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQueryParams = Record<string, ApiQueryValue>;
