import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SignInButton } from "@/components/auth/sign-in-button";

const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

beforeEach(() => {
  mockSignIn.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SignInButton", () => {
  it("renders the idle state with the GitHub icon and CTA label", () => {
    render(<SignInButton />);
    const button = screen.getByRole("button", { name: /continue with github/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("shows a loading state and aria-busy when signIn is pending", () => {
    mockSignIn.mockReturnValue(new Promise(() => {}));
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));

    const loading = screen.getByRole("button", { name: /connecting to github/i });
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute("aria-busy", "true");
  });

  it("surfaces an error message when signIn throws", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Network down"));
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/network down/i);
    const retry = screen.getByRole("button", { name: /try again/i });
    expect(retry).toBeInTheDocument();
  });

  it("surfaces a fallback error message when signIn throws a non-Error", async () => {
    mockSignIn.mockRejectedValueOnce("plain string");
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/couldn't reach github/i);
  });

  it("triggers the safety timeout and recovers via Reset", async () => {
    vi.useFakeTimers();
    mockSignIn.mockReturnValue(new Promise(() => {}));
    render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));

    await act(async () => {
      vi.advanceTimersByTime(8_000);
    });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/taking longer than expected/i);

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(
      screen.getByRole("button", { name: /continue with github/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("ignores double-clicks while loading", () => {
    mockSignIn.mockReturnValue(new Promise(() => {}));
    render(<SignInButton />);

    const button = screen.getByRole("button", { name: /continue with github/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it("announces status changes via aria-live region", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("OAuth misconfigured"));
    render(<SignInButton />);

    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));

    await screen.findByRole("alert");
    expect(screen.getByRole("status")).toHaveTextContent(/oauth misconfigured/i);
  });

  it("cleans up the safety timer on unmount", () => {
    vi.useFakeTimers();
    mockSignIn.mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<SignInButton />);

    fireEvent.click(screen.getByRole("button", { name: /continue with github/i }));
    unmount();

    expect(() => vi.advanceTimersByTime(8_000)).not.toThrow();
  });
});
