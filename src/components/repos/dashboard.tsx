"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RepoList } from "@/components/repos/repo-list";
import { DashboardHeader } from "@/components/repos/dashboard-header";
import { BulkActionBar } from "@/components/repos/bulk-action-bar";
import { StatePlaceholder } from "@/components/repos/state-placeholder";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";
import { DeleteRepoModal } from "@/components/repos/delete-repo-modal";
import { EditRepoModal } from "@/components/repos/edit-repo-modal";
import { CreateRepoModal } from "@/components/repos/create-repo-modal";
import { BulkDeleteModal } from "@/components/repos/bulk-delete-modal";
import { FloatingCreateRepoButton } from "@/components/repos/floating-create-repo-button";
import { useRepos } from "@/hooks/use-repos";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";
import { useToggleVisibility } from "@/hooks/use-repo-mutations";
import type { Repository } from "@/types/github";

export function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useRepos();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["repos"] }) > 0;
  const {
    searchQuery,
    resetFilters,
    selectedRepoIds,
    setSelectedRepoIds,
    openDeleteModal,
    openEditModal,
    deleteTargetId,
    editTargetId,
  } = useUIStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      resetFilters: state.resetFilters,
      selectedRepoIds: state.selectedRepoIds,
      setSelectedRepoIds: state.setSelectedRepoIds,
      openDeleteModal: state.openDeleteModal,
      openEditModal: state.openEditModal,
      deleteTargetId: state.deleteTargetId,
      editTargetId: state.editTargetId,
    }))
  );
  const { mutate: toggleVisibility } = useToggleVisibility();

  const handleReset = () => {
    resetFilters();
  };

  const handleReload = () => {
    void queryClient.invalidateQueries({ queryKey: ["repos"] });
  };

  const handleToggleSelect = (id: number) => {
    const next = new Set(selectedRepoIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRepoIds(next);
  };

  const handleEdit = (repo: Repository) => openEditModal(repo.id);
  const handleDelete = (repo: Repository) => openDeleteModal(repo.id);
  const handleToggleVisibility = (repo: Repository) => {
    toggleVisibility({
      owner: repo.owner.login,
      repo: repo.name,
      repoId: repo.id,
      currentPrivate: repo.private,
    });
  };

  const repos = data?.items ?? [];

  const repoMap = new Map<number, Repository>();
  for (const r of repos) repoMap.set(r.id, r);

  const targetDeleteRepo = deleteTargetId
    ? repoMap.get(deleteTargetId) ?? null
    : null;
  const targetEditRepo = editTargetId
    ? repoMap.get(editTargetId) ?? null
    : null;

  const selectedRows = Array.from(selectedRepoIds)
    .map((id) => repoMap.get(id))
    .filter((r): r is Repository => !!r);

  return (
    <div className="space-y-6">
      <DashboardHeader
        totalCount={data?.total_count}
        isLoading={isLoading}
        visibleCount={repos.length}
      />

      {isLoading ? (
        <RepoListSkeleton count={10} />
      ) : isError ? (
        <StatePlaceholder
          type="error"
          message={error instanceof Error ? error.message : undefined}
          onAction={() => void refetch()}
        />
      ) : repos.length === 0 ? (
        <StatePlaceholder
          type={searchQuery !== "" ? "filtered" : "empty"}
          onAction={searchQuery !== "" ? handleReset : undefined}
        />
      ) : (
        <>
          <BulkActionBar selectedRepos={selectedRows} />
          <RepoList
            repos={repos}
            selectedIds={selectedRepoIds}
            onToggleSelect={handleToggleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
            onReload={handleReload}
            isReloading={isFetching}
          />
        </>
      )}

      <DeleteRepoModal repo={targetDeleteRepo} />
      <EditRepoModal repo={targetEditRepo} />
      <CreateRepoModal />
      <BulkDeleteModal selectedRepos={selectedRows} />
      <FloatingCreateRepoButton />
    </div>
  );
}
