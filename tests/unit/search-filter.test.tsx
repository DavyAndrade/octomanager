import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/components/repos/search-bar";
import { useUIStore } from "@/store/ui-store";
import { TooltipProvider } from "@/components/ui/tooltip";

beforeEach(() => {
  useUIStore.setState({
    searchQuery: "",
    activeSection: "owner",
  sortBy: "pushed",
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
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
    expect(
      screen.getByPlaceholderText("Search repositories...")
    ).toBeInTheDocument();
  });

  it("updates local value on input", () => {
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
    const input = screen.getByPlaceholderText("Search repositories...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "octo" } });
    expect(input.value).toBe("octo");
  });

  it("debounces store update by 300ms", async () => {
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
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
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("clears input and store on clear button click", async () => {
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
    const input = screen.getByPlaceholderText("Search repositories...");
    fireEvent.change(input, { target: { value: "octo" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole("button"));
    expect((input as HTMLInputElement).value).toBe("");
    expect(useUIStore.getState().searchQuery).toBe("");
  });

  it("clears input and blurs on Escape key", async () => {
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
    const input = screen.getByPlaceholderText("Search repositories...") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "octo" } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(input.value).toBe("");
    expect(useUIStore.getState().searchQuery).toBe("");
    expect(document.activeElement).not.toBe(input);
  });

  it("syncs when store searchQuery is reset to empty externally", async () => {
    render(
      <TooltipProvider>
        <SearchBar />
      </TooltipProvider>
    );
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
