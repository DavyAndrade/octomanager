import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // shadcn primitives — not business logic
        "src/components/ui/**",
        // API routes — integration-tested, not unit-tested
        "src/app/api/**",
        // Type declarations
        "src/**/*.d.ts",
        "src/types/**",
        // Next.js / framework config files that require full runtime context
        "src/proxy.ts",
        "src/lib/auth.ts",
        "src/lib/query-client.ts",
        "src/app/**",
        // Layout / auth components — require NextAuth session context
        "src/components/layout/**",
        "src/components/auth/**",
        // Complex composite components — covered by e2e / integration tests
        "src/components/repos/repo-table.tsx",
        "src/components/repos/repo-table-columns.tsx",
        "src/components/repos/repo-list.tsx",
        "src/components/repos/bulk-action-bar.tsx",
        "src/components/repos/bulk-delete-modal.tsx",
        "src/components/repos/delete-repo-modal.tsx",
        "src/components/repos/edit-repo-modal.tsx",
        "src/components/repos/repo-card.tsx",
        // Mutations hook — optimistic update logic is e2e territory
        "src/hooks/use-repo-mutations.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
