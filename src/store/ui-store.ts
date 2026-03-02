import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RepoTypeFilter, RepoSortField } from "@/types/github";

interface UIState {
  // Search & filters
  searchQuery: string;
  visibilityFilter: RepoTypeFilter;
  sortBy: RepoSortField;
  sortDirection: "asc" | "desc";

  // Bulk selection
  selectedRepoIds: Set<number>;

  // Modal state
  deleteTargetId: number | null;
  editTargetId: number | null;
  bulkDeleteOpen: boolean;

  // Actions — filters
  setSearchQuery: (query: string) => void;
  setVisibilityFilter: (filter: RepoTypeFilter) => void;
  setSortBy: (field: RepoSortField) => void;
  setSortDirection: (dir: "asc" | "desc") => void;
  resetFilters: () => void;

  // Actions — selection
  toggleSelected: (repoId: number) => void;
  selectAll: (repoIds: number[]) => void;
  clearSelection: () => void;

  // Actions — modals
  openDeleteModal: (repoId: number) => void;
  closeDeleteModal: () => void;
  openEditModal: (repoId: number) => void;
  closeEditModal: () => void;
  openBulkDelete: () => void;
  closeBulkDelete: () => void;
}

const defaultState = {
  searchQuery: "",
  visibilityFilter: "all" as RepoTypeFilter,
  sortBy: "updated" as RepoSortField,
  sortDirection: "desc" as const,
  selectedRepoIds: new Set<number>(),
  deleteTargetId: null,
  editTargetId: null,
  bulkDeleteOpen: false,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      ...defaultState,

      // Filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setVisibilityFilter: (filter) => set({ visibilityFilter: filter }),
      setSortBy: (field) => set({ sortBy: field }),
      setSortDirection: (dir) => set({ sortDirection: dir }),
      resetFilters: () =>
        set({
          searchQuery: defaultState.searchQuery,
          visibilityFilter: defaultState.visibilityFilter,
          sortBy: defaultState.sortBy,
          sortDirection: defaultState.sortDirection,
        }),

      // Selection
      toggleSelected: (repoId) =>
        set((state) => {
          const next = new Set(state.selectedRepoIds);
          if (next.has(repoId)) next.delete(repoId);
          else next.add(repoId);
          return { selectedRepoIds: next };
        }),
      selectAll: (repoIds) =>
        set({ selectedRepoIds: new Set(repoIds) }),
      clearSelection: () =>
        set({ selectedRepoIds: new Set<number>() }),

      // Modals
      openDeleteModal: (repoId) => set({ deleteTargetId: repoId }),
      closeDeleteModal: () => set({ deleteTargetId: null }),
      openEditModal: (repoId) => set({ editTargetId: repoId }),
      closeEditModal: () => set({ editTargetId: null }),
      openBulkDelete: () => set({ bulkDeleteOpen: true }),
      closeBulkDelete: () => set({ bulkDeleteOpen: false }),
    }),
    { name: "ui-store" }
  )
);
