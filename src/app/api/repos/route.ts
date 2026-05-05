import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listRepos, createRepo } from "@/lib/octokit";
import { repoListParamsSchema, createRepoSchema } from "@/schemas/repo";
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

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parseResult = createRepoSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json<ApiError>(
      { error: "Validation failed", code: parseResult.error.message },
      { status: 422 }
    );
  }

  try {
    const createdRepo = await createRepo(session.accessToken, parseResult.data);

    console.info(
      `[AUDIT] Repository created by ${session.user?.login || "unknown"}: ${createdRepo.full_name}`
    );

    return NextResponse.json({ data: createdRepo });
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
        ? "An unexpected error occurred while creating the repository"
        : message;

    console.error("[API_REPOS_POST]", error);

    return NextResponse.json<ApiError>({ error: safeMessage }, { status });
  }
}