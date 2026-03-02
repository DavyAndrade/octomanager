import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these are available when vi.mock factory runs (mock hoisting)
const { mockPaginate, mockReplaceAllTopics, mockRepoGet, mockRepoUpdate, mockRepoDelete } =
  vi.hoisted(() => ({
    mockPaginate: vi.fn(),
    mockReplaceAllTopics: vi.fn(),
    mockRepoGet: vi.fn(),
    mockRepoUpdate: vi.fn(),
    mockRepoDelete: vi.fn(),
  }));

vi.mock("octokit", () => {
  // Use a class so `new Octokit()` works correctly
  class MockOctokit {
    paginate = mockPaginate;
    rest = {
      repos: {
        listForAuthenticatedUser: vi.fn(),
        replaceAllTopics: mockReplaceAllTopics,
        get: mockRepoGet,
        update: mockRepoUpdate,
        delete: mockRepoDelete,
      },
    };
  }
  return { Octokit: MockOctokit };
});

import { listRepos, updateRepo, deleteRepo } from "@/lib/octokit";

const fakeRepo = (overrides = {}) => ({
  id: 1,
  name: "my-repo",
  full_name: "user/my-repo",
  private: false,
  fork: false,
  description: "A test repo",
  homepage: null,
  language: "TypeScript",
  stargazers_count: 0,
  forks_count: 0,
  topics: [],
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  pushed_at: new Date().toISOString(),
  html_url: "https://github.com/user/my-repo",
  clone_url: "",
  visibility: "public",
  default_branch: "main",
  archived: false,
  owner: { login: "user", avatar_url: "", html_url: "" },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── listRepos ─────────────────────────────────────────────────────────────────

describe("listRepos", () => {
  it("returns repos from paginate", async () => {
    const repos = [fakeRepo({ id: 1 }), fakeRepo({ id: 2 })];
    mockPaginate.mockResolvedValue(repos);

    const result = await listRepos("token");

    expect(result.items).toHaveLength(2);
    expect(result.total_count).toBe(2);
    expect(result.has_next_page).toBe(false);
  });

  it("filters forks when type=forks", async () => {
    mockPaginate.mockResolvedValue([
      fakeRepo({ fork: true }),
      fakeRepo({ fork: false }),
    ]);

    const result = await listRepos("token", { type: "forks" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].fork).toBe(true);
  });

  it("filters non-forks when type=sources", async () => {
    mockPaginate.mockResolvedValue([
      fakeRepo({ fork: true }),
      fakeRepo({ fork: false }),
    ]);

    const result = await listRepos("token", { type: "sources" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].fork).toBe(false);
  });

  it("filters by search term on name", async () => {
    mockPaginate.mockResolvedValue([
      fakeRepo({ name: "octo-manager" }),
      fakeRepo({ name: "other" }),
    ]);

    const result = await listRepos("token", { search: "octo" });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe("octo-manager");
  });

  it("filters by search term on description", async () => {
    mockPaginate.mockResolvedValue([
      fakeRepo({ description: "github manager" }),
      fakeRepo({ description: "other stuff" }),
    ]);

    const result = await listRepos("token", { search: "github" });

    expect(result.items).toHaveLength(1);
  });

  it("filters by search term on topics", async () => {
    mockPaginate.mockResolvedValue([
      fakeRepo({ topics: ["nextjs", "typescript"] }),
      fakeRepo({ topics: ["python"] }),
    ]);

    const result = await listRepos("token", { search: "nextjs" });

    expect(result.items).toHaveLength(1);
  });

  it("returns empty array when no repos match search", async () => {
    mockPaginate.mockResolvedValue([fakeRepo()]);

    const result = await listRepos("token", { search: "zzznomatch" });

    expect(result.items).toHaveLength(0);
    expect(result.total_count).toBe(0);
  });

  it("throws typed error on 401", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { status: 401 })
    );
    await expect(listRepos("bad-token")).rejects.toThrow(
      "GitHub token is invalid or expired"
    );
  });

  it("throws rate-limit message on 403 with rate limit text", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("rate limit exceeded"), { status: 403 })
    );
    await expect(listRepos("token")).rejects.toThrow("rate limit");
  });

  it("throws forbidden on 403 without rate limit text", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("Forbidden"), { status: 403 })
    );
    await expect(listRepos("token")).rejects.toThrow(
      "insufficient GitHub permissions"
    );
  });

  it("throws on 404", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("Not Found"), { status: 404 })
    );
    await expect(listRepos("token")).rejects.toThrow("Repository not found");
  });

  it("throws Validation failed on 422", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("Name already taken"), { status: 422 })
    );
    await expect(listRepos("token")).rejects.toThrow("Validation failed");
  });

  it("throws generic message on unknown status", async () => {
    mockPaginate.mockRejectedValue(
      Object.assign(new Error("Server Error"), { status: 500 })
    );
    await expect(listRepos("token")).rejects.toThrow("GitHub API error (500)");
  });

  it("throws unexpected error when no status property", async () => {
    mockPaginate.mockRejectedValue(new Error("network failure"));
    await expect(listRepos("token")).rejects.toThrow(
      "An unexpected error occurred"
    );
  });
});

// ─── updateRepo ────────────────────────────────────────────────────────────────

describe("updateRepo", () => {
  it("calls repos.update with payload", async () => {
    const updated = fakeRepo({ name: "new-name" });
    mockRepoUpdate.mockResolvedValue({ data: updated });

    const result = await updateRepo("token", "user", "my-repo", {
      name: "new-name",
    });

    expect(result.name).toBe("new-name");
    expect(mockRepoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "user", repo: "my-repo", name: "new-name" })
    );
  });

  it("calls replaceAllTopics when topics provided", async () => {
    mockReplaceAllTopics.mockResolvedValue({});
    mockRepoUpdate.mockResolvedValue({ data: fakeRepo() });

    await updateRepo("token", "user", "repo", {
      name: "repo",
      topics: ["ts", "next"],
    });

    expect(mockReplaceAllTopics).toHaveBeenCalledWith({
      owner: "user",
      repo: "repo",
      names: ["ts", "next"],
    });
  });

  it("fetches repo when only topics are updated", async () => {
    mockReplaceAllTopics.mockResolvedValue({});
    mockRepoGet.mockResolvedValue({ data: fakeRepo({ topics: ["ts"] }) });

    const result = await updateRepo("token", "user", "repo", {
      topics: ["ts"],
    });

    expect(mockRepoGet).toHaveBeenCalled();
    expect(result.topics).toContain("ts");
  });

  it("throws on error", async () => {
    mockRepoUpdate.mockRejectedValue(
      Object.assign(new Error("Not Found"), { status: 404 })
    );
    await expect(
      updateRepo("token", "user", "repo", { name: "x" })
    ).rejects.toThrow("Repository not found");
  });
});

// ─── deleteRepo ────────────────────────────────────────────────────────────────

describe("deleteRepo", () => {
  it("calls repos.delete with owner and repo", async () => {
    mockRepoDelete.mockResolvedValue({});

    await deleteRepo("token", "user", "repo");

    expect(mockRepoDelete).toHaveBeenCalledWith({
      owner: "user",
      repo: "repo",
    });
  });

  it("throws on 401", async () => {
    mockRepoDelete.mockRejectedValue(
      Object.assign(new Error("Unauthorized"), { status: 401 })
    );
    await expect(deleteRepo("token", "user", "repo")).rejects.toThrow(
      "GitHub token is invalid or expired"
    );
  });
});
