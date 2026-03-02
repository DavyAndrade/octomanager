export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  error: string;
  code?: string;
  status?: number;
  data?: never;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  per_page: number;
  has_next_page: boolean;
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";
