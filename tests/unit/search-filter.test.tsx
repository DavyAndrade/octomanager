import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/components/repos/search-bar";
import { FilterBar } from "@/components/repos/filter-bar";
import { useUIStore } from "@/store/ui-store";

beforeEach(() => {
  // Reset Zustand state before each test
  useUIStore.setState({
    searchQuery: "",
    visibilityFilter: "owner",
    sortBy: "updated",
    sortDirection: "desc",
    selectedRepoIds: new Set(),
    deleteTargetId: null,
    editTargetId: null,
    bulkDeleteOpen: false,
  });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── SearchBar ─────────────────────────────────────────────────────────────────

describe("SearchBar", () => {
  it("renders input with placeholder", () => {
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText("Search repositories...")
    ).toBeInTheDocument();
  });

  it("updates local value on input", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search repositories...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "octo" } });
    expect(input.value).toBe("octo");
  });

  it("debounces store update by 300ms", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });

    // Store not updated yet
    expect(useUIStore.getState().searchQuery).toBe("");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(useUIStore.getState().searchQuery).toBe("octo");
  });

  it("shows clear button when input has value", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("clears input and store on clear button click", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole("button"));
    expect((input as HTMLInputElement).value).toBe("");
    expect(useUIStore.getState().searchQuery).toBe("");
  });

  it("syncs when store searchQuery is reset to empty externally", async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Simulate external reset (e.g. resetFilters)
    act(() => {
      useUIStore.getState().setSearchQuery("");
    });

    expect((input as HTMLInputElement).value).toBe("");
  });
});

// ─── FilterBar ─────────────────────────────────────────────────────────────────

describe("FilterBar", () => {
  it("renders visibility and sort selects", () => {
    render(<FilterBar />);
    // My repos option is the default trigger text
    expect(screen.getByText("My repos")).toBeInTheDocument();
    expect(screen.getByText("Recently updated")).toBeInTheDocument();
  });

  it("does not show Reset button when using defaults", () => {
    render(<FilterBar />);
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });

  it("shows Reset button when searchQuery is non-empty", () => {
    useUIStore.setState({ searchQuery: "octo" });
    render(<FilterBar />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("shows Reset button when sortBy is not default", () => {
    useUIStore.setState({ sortBy: "created" });
    render(<FilterBar />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("calls resetFilters on Reset button click", () => {
    useUIStore.setState({ searchQuery: "octo" });
    render(<FilterBar />);
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(useUIStore.getState().searchQuery).toBe("");
    expect(useUIStore.getState().visibilityFilter).toBe("owner");
  });
});
