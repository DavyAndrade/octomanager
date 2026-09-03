import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RepoSortField } from "@/types/github";

export type RepoSectionId =
  | "all"
  | "owner"
  | "public"
  | "private"
  | "collabs"
  | "forks"
  | "archived";

interface UIState {
  // Search & filters
  searchQuery: string;
  activeSection: RepoSectionId;
  sortBy: RepoSortField;
  sortDirection: "asc" | "desc";

  // Bulk selection
  selectedRepoIds: Set<number>;

  // Modal state
  deleteTargetId: number | null;
  editTargetId: number | null;
  createTargetId: number | null;
  bulkDeleteOpen: boolean;

  // Actions — filters
  setSearchQuery: (query: string) => void;
  setActiveSection: (section: RepoSectionId) => void;
  setSortBy: (field: RepoSortField) => void;
  setSortDirection: (dir: "asc" | "desc") => void;
  resetFilters: () => void;

  // Actions — selection
  toggleSelected: (repoId: number) => void;
  selectAll: (repoIds: number[]) => void;
  setSelectedRepoIds: (repoIds: Set<number>) => void;
  clearSelection: () => void;

  // Actions — modals
  openDeleteModal: (repoId: number) => void;
  closeDeleteModal: () => void;
  openEditModal: (repoId: number) => void;
  closeEditModal: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openBulkDelete: () => void;
  closeBulkDelete: () => void;
}

const defaultState = {
  searchQuery: "",
  activeSection: "owner" as RepoSectionId,
  sortBy: "pushed" as RepoSortField,
  sortDirection: "desc" as const,
  selectedRepoIds: new Set<number>(),
  deleteTargetId: null,
  editTargetId: null,
  createTargetId: null,
  bulkDeleteOpen: false,
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      ...defaultState,

      // Filters
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveSection: (section) => set({ activeSection: section }),
      setSortBy: (field) => set({ sortBy: field }),
      setSortDirection: (dir) => set({ sortDirection: dir }),
      resetFilters: () =>
        set({
          searchQuery: defaultState.searchQuery,
          activeSection: defaultState.activeSection,
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
      selectAll: (repoIds) => set({ selectedRepoIds: new Set(repoIds) }),
      setSelectedRepoIds: (repoIds) => set({ selectedRepoIds: repoIds }),
      clearSelection: () => set({ selectedRepoIds: new Set<number>() }),

      // Modals
      openDeleteModal: (repoId) => set({ deleteTargetId: repoId }),
      closeDeleteModal: () => set({ deleteTargetId: null }),
      openEditModal: (repoId) => set({ editTargetId: repoId }),
      closeEditModal: () => set({ editTargetId: null }),
      openCreateModal: () => set({ createTargetId: Date.now() }),
      closeCreateModal: () => set({ createTargetId: null }),
      openBulkDelete: () => set({ bulkDeleteOpen: true }),
      closeBulkDelete: () => set({ bulkDeleteOpen: false }),
    }),
    { name: "ui-store" }
  )
);
