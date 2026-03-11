import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/store/ui-store";

const initialState = {
  searchQuery: "",
  visibilityFilter: "owner",
  sortBy: "pushed",
  sortDirection: "desc",
  selectedRepoIds: new Set<number>(),
  deleteTargetId: null,
  editTargetId: null,
  bulkDeleteOpen: false,
} as const;

beforeEach(() => {
  useUIStore.setState({ ...initialState, selectedRepoIds: new Set<number>() });
});

// ─── Search & Filters ─────────────────────────────────────────────────────────

describe("setSearchQuery", () => {
  it("updates searchQuery", () => {
    useUIStore.getState().setSearchQuery("octo");
    expect(useUIStore.getState().searchQuery).toBe("octo");
  });

  it("clears searchQuery when set to empty string", () => {
    useUIStore.getState().setSearchQuery("octo");
    useUIStore.getState().setSearchQuery("");
    expect(useUIStore.getState().searchQuery).toBe("");
  });
});

describe("setVisibilityFilter", () => {
  it("updates visibilityFilter to public", () => {
    useUIStore.getState().setVisibilityFilter("public");
    expect(useUIStore.getState().visibilityFilter).toBe("public");
  });

  it("updates visibilityFilter to private", () => {
    useUIStore.getState().setVisibilityFilter("private");
    expect(useUIStore.getState().visibilityFilter).toBe("private");
  });

  it("updates visibilityFilter to owner", () => {
    useUIStore.getState().setVisibilityFilter("owner");
    expect(useUIStore.getState().visibilityFilter).toBe("owner");
  });

  it("updates visibilityFilter to all", () => {
    useUIStore.getState().setVisibilityFilter("all");
    expect(useUIStore.getState().visibilityFilter).toBe("all");
  });
});

describe("setSortBy", () => {
  it("updates sortBy", () => {
    useUIStore.getState().setSortBy("created");
    expect(useUIStore.getState().sortBy).toBe("created");
  });
});

describe("setSortDirection", () => {
  it("updates sortDirection to asc", () => {
    useUIStore.getState().setSortDirection("asc");
    expect(useUIStore.getState().sortDirection).toBe("asc");
  });
});

describe("resetFilters", () => {
  it("restores all filter defaults", () => {
    useUIStore.getState().setSearchQuery("hello");
    useUIStore.getState().setVisibilityFilter("private");
    useUIStore.getState().setSortBy("created");
    useUIStore.getState().setSortDirection("asc");

    useUIStore.getState().resetFilters();

    const { searchQuery, visibilityFilter, sortBy, sortDirection } =
      useUIStore.getState();
    expect(searchQuery).toBe("");
    expect(visibilityFilter).toBe("owner");
    expect(sortBy).toBe("pushed");
    expect(sortDirection).toBe("desc");
  });
});

// ─── Bulk Selection ────────────────────────────────────────────────────────────

describe("toggleSelected", () => {
  it("adds a repo id when not selected", () => {
    useUIStore.getState().toggleSelected(1);
    expect(useUIStore.getState().selectedRepoIds.has(1)).toBe(true);
  });

  it("removes a repo id when already selected", () => {
    useUIStore.getState().toggleSelected(1);
    useUIStore.getState().toggleSelected(1);
    expect(useUIStore.getState().selectedRepoIds.has(1)).toBe(false);
  });

  it("handles multiple distinct ids", () => {
    useUIStore.getState().toggleSelected(1);
    useUIStore.getState().toggleSelected(2);
    const { selectedRepoIds } = useUIStore.getState();
    expect(selectedRepoIds.size).toBe(2);
    expect(selectedRepoIds.has(1)).toBe(true);
    expect(selectedRepoIds.has(2)).toBe(true);
  });
});

describe("selectAll", () => {
  it("selects all provided ids", () => {
    useUIStore.getState().selectAll([10, 20, 30]);
    const { selectedRepoIds } = useUIStore.getState();
    expect(selectedRepoIds.size).toBe(3);
    expect(selectedRepoIds.has(20)).toBe(true);
  });

  it("replaces existing selection", () => {
    useUIStore.getState().selectAll([1, 2]);
    useUIStore.getState().selectAll([5]);
    expect(useUIStore.getState().selectedRepoIds.size).toBe(1);
    expect(useUIStore.getState().selectedRepoIds.has(5)).toBe(true);
  });
});

describe("clearSelection", () => {
  it("empties selectedRepoIds", () => {
    useUIStore.getState().selectAll([1, 2, 3]);
    useUIStore.getState().clearSelection();
    expect(useUIStore.getState().selectedRepoIds.size).toBe(0);
  });
});

// ─── Modals ────────────────────────────────────────────────────────────────────

describe("delete modal", () => {
  it("opens with target repo id", () => {
    useUIStore.getState().openDeleteModal(42);
    expect(useUIStore.getState().deleteTargetId).toBe(42);
  });

  it("closes and clears target id", () => {
    useUIStore.getState().openDeleteModal(42);
    useUIStore.getState().closeDeleteModal();
    expect(useUIStore.getState().deleteTargetId).toBeNull();
  });
});

describe("edit modal", () => {
  it("opens with target repo id", () => {
    useUIStore.getState().openEditModal(7);
    expect(useUIStore.getState().editTargetId).toBe(7);
  });

  it("closes and clears target id", () => {
    useUIStore.getState().openEditModal(7);
    useUIStore.getState().closeEditModal();
    expect(useUIStore.getState().editTargetId).toBeNull();
  });
});

describe("bulk delete modal", () => {
  it("opens bulk delete", () => {
    useUIStore.getState().openBulkDelete();
    expect(useUIStore.getState().bulkDeleteOpen).toBe(true);
  });

  it("closes bulk delete", () => {
    useUIStore.getState().openBulkDelete();
    useUIStore.getState().closeBulkDelete();
    expect(useUIStore.getState().bulkDeleteOpen).toBe(false);
  });
});

// ─── Initial State ─────────────────────────────────────────────────────────────

describe("initial state", () => {
  it("has correct defaults", () => {
    const state = useUIStore.getState();
    expect(state.searchQuery).toBe("");
    expect(state.visibilityFilter).toBe("owner");
    expect(state.sortBy).toBe("pushed");
    expect(state.sortDirection).toBe("desc");
    expect(state.selectedRepoIds.size).toBe(0);
    expect(state.deleteTargetId).toBeNull();
    expect(state.editTargetId).toBeNull();
    expect(state.bulkDeleteOpen).toBe(false);
  });
});
