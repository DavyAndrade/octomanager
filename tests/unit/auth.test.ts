import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captured = vi.hoisted(() => ({ config: undefined as unknown }));

vi.mock("next-auth", () => ({
  default: (config: unknown) => {
    captured.config = config;
    return {
      handlers: {},
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
  },
}));

vi.mock("next-auth/providers/github", () => ({
  default: () => ({ id: "github" }),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: () => ({ id: "credentials" }),
}));

type JwtCallback = (params: {
  token: Record<string, unknown>;
  account?: {
    access_token?: string;
    expires_at?: number;
    refresh_token?: string;
  };
  profile?: { login?: string };
  user?: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

function callbacks() {
  return (captured.config as {
    callbacks: { jwt: JwtCallback };
  }).callbacks;
}

describe("Auth configuration", () => {
  beforeEach(async () => {
    vi.resetModules();
    await import("@/lib/auth");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes an expired GitHub access token before it is used", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "renewed-token",
          expires_in: 28_800,
          refresh_token: "next-refresh-token",
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const token = await callbacks().jwt({
      token: {
        accessToken: "expired-token",
        accessTokenExpiresAt: Date.now() - 1,
        refreshToken: "refresh-token",
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(token).toMatchObject({
      accessToken: "renewed-token",
      refreshToken: "next-refresh-token",
    });
    expect(token.accessTokenExpiresAt).toEqual(expect.any(Number));
  });
});
