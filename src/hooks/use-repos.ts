"use client";

import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";
import type { PaginatedResponse } from "@/types/api";
import type { Repository } from "@/types/github";

export const repoKeys = {
  all: ["repos"] as const,
  list: (params: Record<string, string | number | undefined>) =>
    [...repoKeys.all, "list", params] as const,
};

async function fetchRepos(
  params: Record<string, string | number | undefined>
): Promise<PaginatedResponse<Repository>> {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const res = await fetch(`/api/repos?${searchParams.toString()}`);

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw Object.assign(
      new Error(errorData.error ?? "Failed to fetch repositories"),
      { status: res.status }
    );
  }

  const json = (await res.json()) as { data: PaginatedResponse<Repository> };
  return json.data;
}

export function useRepos(page = 1) {
  const { searchQuery, visibilityFilter, sortBy, sortDirection } = useUIStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      visibilityFilter: state.visibilityFilter,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    }))
  );

  const params = {
    type: visibilityFilter,
    sort: sortBy,
    direction: sortDirection,
    per_page: 10,
    page,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useQuery({
    queryKey: repoKeys.list(params),
    queryFn: () => fetchRepos(params),
  });
}
