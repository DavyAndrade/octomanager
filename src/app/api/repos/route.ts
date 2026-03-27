import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listRepos } from "@/lib/octokit";
import { repoListParamsSchema } from "@/schemas/repo";
import type { ApiError } from "@/types/api";

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parseResult = repoListParamsSchema.safeParse(
    Object.fromEntries(searchParams)
  );

  if (!parseResult.success) {
    return NextResponse.json<ApiError>(
      { error: "Invalid query parameters", code: parseResult.error.message },
      { status: 400 }
    );
  }

  try {
    const result = await listRepos(session.accessToken, parseResult.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    // Only return the error message if it's a known GitHub error from handleGitHubError
    // Unexpected errors should be masked to prevent information leakage
    const isKnownError =
      error instanceof Error &&
      (error.message.includes("GitHub") ||
        error.message.includes("Repository not found") ||
        error.message.includes("Validation failed"));

    const message = isKnownError
      ? error.message
      : "An unexpected error occurred while fetching repositories";

    console.error("[API_REPOS_GET]", error);

    return NextResponse.json<ApiError>(
      { error: message },
      { status: isKnownError ? 400 : 500 }
    );
  }
}
