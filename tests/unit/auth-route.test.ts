import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authGet } = vi.hoisted(() => ({ authGet: vi.fn() }));

vi.mock("@/lib/auth", () => ({
  handlers: { GET: authGet, POST: vi.fn() },
}));

import { GET } from "@/app/api/auth/[...nextauth]/route";

describe("Auth session route", () => {
  it("redacts OAuth access tokens from the browser session response", async () => {
    authGet.mockResolvedValueOnce(
      Response.json({
        user: { name: "Davy", login: "davy" },
        expires: "2026-10-11T00:00:00.000Z",
        accessToken: "secret-token",
      })
    );

    const response = await GET(
      new NextRequest("http://localhost:3000/api/auth/session")
    );

    expect(await response.json()).toEqual({
      user: { name: "Davy", login: "davy" },
      expires: "2026-10-11T00:00:00.000Z",
    });
  });
});
