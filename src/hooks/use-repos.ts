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

export function useRepos() {
  const { searchQuery, sortBy, sortDirection } = useUIStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      sortDirection: state.sortDirection,
    }))
  );

  const params = {
    type: "all",
    sort: sortBy,
    direction: sortDirection,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useQuery({
    queryKey: repoKeys.list(params),
    queryFn: () => fetchRepos(params),
  });
}
