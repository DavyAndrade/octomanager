export interface ApiError {
  error: string;
  code?: string;
  status?: number;
  data?: never;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  per_page: number;
  has_next_page: boolean;
}
