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
    // Determine status and mask internal details for 500 errors
    const status =
      error instanceof Error && "status" in (error as { status: unknown })
        ? (error as { status: number }).status
        : error instanceof Error && error.message.includes("not found")
          ? 404
          : error instanceof Error && error.message.includes("Forbidden")
            ? 403
            : 500;

    const message =
      status === 500
        ? "An unexpected error occurred while fetching repositories"
        : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

    console.error("[API_REPOS_GET]", error);

    return NextResponse.json<ApiError>({ error: message }, { status });
  }
}
