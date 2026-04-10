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
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("Forbidden")) status = 403;
    else if (message.includes("Validation failed")) status = 422;
    else if (message.includes("GitHub token")) status = 401;

    const safeMessage =
      status === 500
        ? "An unexpected error occurred while fetching repositories"
        : message;

    console.error("[API_REPOS_GET]", error);

    return NextResponse.json<ApiError>({ error: safeMessage }, { status });
  }
}
