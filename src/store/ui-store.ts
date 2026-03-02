import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RepoTypeFilter, RepoSortField } from "@/types/github";

interface UIState {
  // Search & filters
  searchQuery: string;
  visibilityFilter: RepoTypeFilter;
  sortBy: RepoSortField;
  sortDirection: "asc" | "desc";

  // Modal state
  deleteTargetId: number | null;
  editTargetId: number | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setVisibilityFilter: (filter: RepoTypeFilter) => void;
  setSortBy: (field: RepoSortField) => void;
  setSortDirection: (dir: "asc" | "desc") => void;
  openDeleteModal: (repoId: number) => void;
  closeDeleteModal: () => void;
  openEditModal: (repoId: number) => void;
  closeEditModal: () => void;
  resetFilters: () => void;
}

const defaultState = {
  searchQuery: "",
  visibilityFilter: "all" as RepoTypeFilter,
  sortBy: "updated" as RepoSortField,
  sortDirection: "desc" as const,
  deleteTargetId: null,
  editTargetId: null,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      ...defaultState,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setVisibilityFilter: (filter) => set({ visibilityFilter: filter }),
      setSortBy: (field) => set({ sortBy: field }),
      setSortDirection: (dir) => set({ sortDirection: dir }),
      openDeleteModal: (repoId) => set({ deleteTargetId: repoId }),
      closeDeleteModal: () => set({ deleteTargetId: null }),
      openEditModal: (repoId) => set({ editTargetId: repoId }),
      closeEditModal: () => set({ editTargetId: null }),
      resetFilters: () =>
        set({
          searchQuery: defaultState.searchQuery,
          visibilityFilter: defaultState.visibilityFilter,
          sortBy: defaultState.sortBy,
          sortDirection: defaultState.sortDirection,
        }),
    }),
    { name: "ui-store" }
  )
);
