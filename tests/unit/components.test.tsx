import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/repos/empty-state";
import { ErrorState } from "@/components/repos/error-state";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";

// ─── EmptyState ────────────────────────────────────────────────────────────────

describe("EmptyState", () => {
  it("renders no-repo message when not filtered", () => {
    render(<EmptyState />);
    expect(screen.getByText("No repositories yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("renders filtered message when isFiltered=true", () => {
    render(<EmptyState isFiltered />);
    expect(
      screen.getByText("No repositories match your filters")
    ).toBeInTheDocument();
  });

  it("shows Clear filters button when isFiltered and onReset provided", () => {
    const onReset = vi.fn();
    render(<EmptyState isFiltered onReset={onReset} />);
    const btn = screen.getByRole("button", { name: /clear filters/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("does not show Clear filters button without onReset", () => {
    render(<EmptyState isFiltered />);
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("shows Create repository button when onCreate is provided and not filtered", () => {
    const onCreate = vi.fn();
    render(<EmptyState onCreate={onCreate} />);
    const btn = screen.getByRole("button", { name: /create repository/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it("does not show Create repository button when filtered", () => {
    const onCreate = vi.fn();
    render(<EmptyState isFiltered onCreate={onCreate} />);
    expect(screen.queryByRole("button", { name: /create repository/i })).not.toBeInTheDocument();
  });
});

// ─── ErrorState ────────────────────────────────────────────────────────────────

describe("ErrorState", () => {
  it("renders default error message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Failed to load repositories")).toBeInTheDocument();
    expect(
      screen.getByText(/Something went wrong/i)
    ).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorState message="Rate limit exceeded" />);
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("shows Try again button when onRetry provided", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not show Try again button without onRetry", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});

// ─── RepoListSkeleton ──────────────────────────────────────────────────────────

describe("RepoListSkeleton", () => {
  it("renders default 10 skeleton table rows", () => {
    const { container } = render(<RepoListSkeleton />);
    const tableRows = container.querySelectorAll("tbody tr");
    expect(tableRows).toHaveLength(10);
  });

  it("renders custom count of skeleton table rows", () => {
    const { container } = render(<RepoListSkeleton count={3} />);
    const tableRows = container.querySelectorAll("tbody tr");
    expect(tableRows).toHaveLength(3);
  });
});
