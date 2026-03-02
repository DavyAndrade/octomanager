import { describe, it, expect } from "vitest";
import { updateRepoSchema, deleteRepoSchema, repoListParamsSchema } from "@/schemas/repo";

describe("updateRepoSchema", () => {
  it("accepts valid full payload", () => {
    const result = updateRepoSchema.safeParse({
      name: "my-repo",
      description: "A description",
      homepage: "https://example.com",
      private: true,
      topics: ["typescript", "nextjs"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts partial payload", () => {
    expect(updateRepoSchema.safeParse({ name: "my-repo" }).success).toBe(true);
    expect(updateRepoSchema.safeParse({ private: false }).success).toBe(true);
  });

  it("rejects name with invalid characters", () => {
    const result = updateRepoSchema.safeParse({ name: "my repo!" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 100 chars", () => {
    const result = updateRepoSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects topics with uppercase letters", () => {
    const result = updateRepoSchema.safeParse({ topics: ["TypeScript"] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 topics", () => {
    const result = updateRepoSchema.safeParse({
      topics: Array.from({ length: 21 }, (_, i) => `topic-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid homepage URL", () => {
    const result = updateRepoSchema.safeParse({ homepage: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts empty string for homepage", () => {
    const result = updateRepoSchema.safeParse({ homepage: "" });
    expect(result.success).toBe(true);
  });
});

describe("deleteRepoSchema", () => {
  it("accepts confirm: true", () => {
    expect(deleteRepoSchema.safeParse({ confirm: true }).success).toBe(true);
  });

  it("rejects confirm: false", () => {
    expect(deleteRepoSchema.safeParse({ confirm: false }).success).toBe(false);
  });

  it("rejects missing confirm", () => {
    expect(deleteRepoSchema.safeParse({}).success).toBe(false);
  });
});

describe("repoListParamsSchema", () => {
  it("accepts all valid params", () => {
    const result = repoListParamsSchema.safeParse({
      type: "public",
      sort: "updated",
      direction: "desc",
      per_page: "30",
      page: "1",
      search: "nextjs",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.per_page).toBe(30);
      expect(result.data.page).toBe(1);
    }
  });

  it("coerces string numbers to number", () => {
    const result = repoListParamsSchema.safeParse({ per_page: "50" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.per_page).toBe(50);
  });

  it("rejects per_page > 100", () => {
    expect(repoListParamsSchema.safeParse({ per_page: "101" }).success).toBe(false);
  });

  it("rejects invalid type value", () => {
    expect(repoListParamsSchema.safeParse({ type: "invalid" }).success).toBe(false);
  });

  it("accepts empty object", () => {
    expect(repoListParamsSchema.safeParse({}).success).toBe(true);
  });
});
