import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatePlaceholder } from "@/components/repos/state-placeholder";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";

// ─── StatePlaceholder (empty) ──────────────────────────────────────────────

describe("StatePlaceholder — empty", () => {
  it("renders no-repo message", () => {
    render(<StatePlaceholder type="empty" />);
    expect(screen.getByText("No repositories yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });

  it("renders filtered message", () => {
    render(<StatePlaceholder type="filtered" />);
    expect(
      screen.getByText("No repositories match your filters")
    ).toBeInTheDocument();
  });

  it("shows Clear filters button when onAction provided", () => {
    const onAction = vi.fn();
    render(<StatePlaceholder type="filtered" onAction={onAction} />);
    const btn = screen.getByRole("button", { name: /clear filters/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("does not show button without onAction", () => {
    render(<StatePlaceholder type="filtered" />);
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
  });
});

// ─── StatePlaceholder (error) ──────────────────────────────────────────────

describe("StatePlaceholder — error", () => {
  it("renders default error message", () => {
    render(<StatePlaceholder type="error" />);
    expect(screen.getByText("Failed to load repositories")).toBeInTheDocument();
    expect(
      screen.getByText(/Something went wrong/i)
    ).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<StatePlaceholder type="error" message="Rate limit exceeded" />);
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("shows Try again button when onAction provided", () => {
    const onAction = vi.fn();
    render(<StatePlaceholder type="error" onAction={onAction} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("does not show Try again button without onAction", () => {
    render(<StatePlaceholder type="error" />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});

// ─── RepoListSkeleton ──────────────────────────────────────────────────────

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
