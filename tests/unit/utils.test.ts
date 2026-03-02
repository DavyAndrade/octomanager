import { describe, it, expect } from "vitest";
import { formatRepoCount, formatRelativeTime, slugify, cn } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("resolves tailwind conflicts — last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("formatRepoCount()", () => {
  it("returns raw count below 1000", () => {
    expect(formatRepoCount(0)).toBe("0");
    expect(formatRepoCount(999)).toBe("999");
  });

  it("formats counts >= 1000 with k suffix", () => {
    expect(formatRepoCount(1000)).toBe("1.0k");
    expect(formatRepoCount(2500)).toBe("2.5k");
    expect(formatRepoCount(12345)).toBe("12.3k");
  });
});

describe("slugify()", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes leading/trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("removes non-alphanumeric characters", () => {
    expect(slugify("hello@world!")).toBe("hello-world");
  });
});

describe("formatRelativeTime()", () => {
  const now = new Date();

  it('returns "just now" for recent timestamps', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 30_000).toISOString())).toBe("just now");
  });

  it("returns minutes ago", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000).toISOString())).toBe("5m ago");
  });

  it("returns hours ago", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 3_600_000).toISOString())).toBe("3h ago");
  });

  it("returns days ago", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 86_400_000).toISOString())).toBe("2d ago");
  });
});
