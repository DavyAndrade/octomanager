"use client";

import { RepoTable } from "@/components/repos/repo-table";
import { EmptyState } from "@/components/repos/empty-state";
import { ErrorState } from "@/components/repos/error-state";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";
import { useRepos } from "@/hooks/use-repos";
import { useUIStore } from "@/store/ui-store";

export function RepoList() {
  const { data, isLoading, isError, error, refetch } = useRepos();
  const { searchQuery, visibilityFilter, resetFilters } = useUIStore();

  if (isLoading) return <RepoListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const repos = data?.items ?? [];
  const isFiltered = searchQuery !== "" || visibilityFilter !== "all";

  if (repos.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onReset={isFiltered ? resetFilters : undefined}
      />
    );
  }

  return <RepoTable repos={repos} />;
}
