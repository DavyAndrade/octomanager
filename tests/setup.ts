import "@testing-library/jest-dom";
import { vi } from "vitest";

// server-only is a Next.js guard that throws outside the Next.js runtime.
// Mock it so server-side modules (octokit.ts, etc.) can be imported in tests.
vi.mock("server-only", () => ({}));
