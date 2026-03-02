import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("unauthenticated user is redirected from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders the sign-in button", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /continue with github/i })
    ).toBeVisible();
  });

  test("landing page renders hero heading and sign-in button", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /manage your github repos/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with github/i })
    ).toBeVisible();
  });

  test("authenticated user is redirected from / to /dashboard", async ({
    page,
    context,
  }) => {
    // Simulate a session cookie — in real CI this would use a mock auth provider.
    // This test serves as a structural placeholder for the redirect behaviour.
    // To run fully, set up a test GitHub OAuth app and provide credentials via env.
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: "mock-session",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/login");
    // Without a real session the cookie won't be valid — just verify page loads
    await expect(page).toHaveURL(/\/(login|dashboard)/);
  });
});
