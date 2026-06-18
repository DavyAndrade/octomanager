import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteRepoModal } from "@/components/repos/delete-repo-modal";
import { useUIStore } from "@/store/ui-store";
import { useDeleteRepo } from "@/hooks/use-repo-mutations";
import type { Repository } from "@/types/github";
import type { Mock } from "vitest";

// Mock the hooks
vi.mock("@/hooks/use-repo-mutations", () => ({
  useDeleteRepo: vi.fn(),
}));

const mockRepo: Repository = {
  id: 123,
  name: "test-repo",
  full_name: "user/test-repo",
  owner: { login: "user", avatar_url: "" },
  private: false,
  description: "Test description",
  html_url: "",
  stargazers_count: 0,
  forks_count: 0,
  updated_at: new Date().toISOString(),
  pushed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  size: 100,
  language: "TypeScript",
  fork: false,
  archived: false,
};

describe("DeleteRepoModal", () => {
  const mockDeleteRepo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDeleteRepo as Mock).mockReturnValue({
      mutate: mockDeleteRepo,
      isPending: false,
    });

    // Reset store
    useUIStore.setState({ deleteTargetId: null });
  });

  it("should not render when no repo is selected", () => {
    const { container } = render(<DeleteRepoModal repo={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render when a repo is selected", async () => {
    render(<DeleteRepoModal repo={mockRepo} />);

    expect(screen.getAllByText("Delete repository").length).toBeGreaterThan(0);
    expect(screen.getAllByText(mockRepo.name).length).toBeGreaterThan(0);
  });

  it("should disable delete button until name matches", async () => {
    render(<DeleteRepoModal repo={mockRepo} />);

    const deleteBtn = screen.getByRole("button", { name: /Delete repository/i });
    const input = screen.getByPlaceholderText(mockRepo.name);

    expect(deleteBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: "wrong-name" } });
    expect(deleteBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: mockRepo.name } });
    expect(deleteBtn).toBeEnabled();
  });

  it("should call deleteRepo on form submit when name matches", async () => {
    render(<DeleteRepoModal repo={mockRepo} />);

    const input = screen.getByPlaceholderText(mockRepo.name);
    fireEvent.change(input, { target: { value: mockRepo.name } });

    const deleteBtn = screen.getByRole("button", { name: /Delete repository/i });
    fireEvent.submit(deleteBtn.closest("form")!);

    expect(mockDeleteRepo).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: mockRepo.owner.login,
        repo: mockRepo.name,
        repoId: mockRepo.id,
      }),
      expect.any(Object)
    );
  });

  it("should reset confirmName when target changes", async () => {
    const otherRepo = { ...mockRepo, id: 456, name: "other-repo" };

    const { rerender } = render(<DeleteRepoModal repo={mockRepo} />);

    const input = screen.getByPlaceholderText(mockRepo.name) as HTMLInputElement;
    fireEvent.change(input, { target: { value: mockRepo.name } });
    expect(input.value).toBe(mockRepo.name);

    // Switch target
    rerender(<DeleteRepoModal repo={otherRepo} />);

    const otherInput = screen.getByPlaceholderText(otherRepo.name) as HTMLInputElement;
    expect(otherInput.value).toBe("");
  });
});
