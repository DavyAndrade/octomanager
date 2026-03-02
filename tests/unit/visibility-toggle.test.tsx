import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VisibilityToggle } from "@/components/repos/visibility-toggle";

const mockMutate = vi.fn();
vi.mock("@/hooks/use-repo-mutations", () => ({
  useToggleVisibility: () => ({ mutate: mockMutate, isPending: false }),
}));

beforeEach(() => {
  mockMutate.mockClear();
});

type Props = React.ComponentProps<typeof VisibilityToggle>;

const renderToggle = (props: Props) =>
  render(
    <TooltipProvider>
      <VisibilityToggle {...props} />
    </TooltipProvider>
  );

describe("VisibilityToggle", () => {
  const base: Props = { repoId: 1, owner: "user", repo: "my-repo", isPrivate: false };

  it("renders a switch", () => {
    renderToggle(base);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("switch is checked (public) when isPrivate=false", () => {
    renderToggle({ ...base, isPrivate: false });
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("switch is unchecked (private) when isPrivate=true", () => {
    renderToggle({ ...base, isPrivate: true });
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("calls toggleVisibility mutate on switch click", () => {
    renderToggle({ ...base, isPrivate: false });
    fireEvent.click(screen.getByRole("switch"));
    expect(mockMutate).toHaveBeenCalledWith({
      owner: "user",
      repo: "my-repo",
      repoId: 1,
      currentPrivate: false,
    });
  });

  it("renders with private=true and calls mutate correctly", () => {
    renderToggle({ ...base, isPrivate: true });
    fireEvent.click(screen.getByRole("switch"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ currentPrivate: true })
    );
  });

  it("has accessible aria-label", () => {
    renderToggle({ ...base, isPrivate: false });
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-label");
    expect(sw.getAttribute("aria-label")).toContain("public");
  });

  it("aria-label reflects private state", () => {
    renderToggle({ ...base, isPrivate: true });
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-label")).toContain("private");
  });
});
