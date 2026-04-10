import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateRepo, deleteRepo } from "@/lib/octokit";
import {
  updateRepoSchema,
  deleteRepoSchema,
  ownerParamSchema,
  repoParamSchema,
} from "@/schemas/repo";
import type { ApiError } from "@/types/api";

interface RouteContext {
  params: Promise<{ owner: string; repo: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { owner, repo } = await params;

  // Validate URL parameters
  const ownerParse = ownerParamSchema.safeParse(owner);
  const repoParse = repoParamSchema.safeParse(repo);

  if (!ownerParse.success || !repoParse.success) {
    return NextResponse.json<ApiError>(
      { error: "Invalid repository path" },
      { status: 400 }
    );
  }

  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json<ApiError>(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parseResult = updateRepoSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json<ApiError>(
      { error: "Validation failed", code: parseResult.error.message },
      { status: 422 }
    );
  }

  if (Object.keys(parseResult.data).length === 0) {
    return NextResponse.json<ApiError>(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateRepo(
      session.accessToken,
      owner,
      repo,
      parseResult.data
    );

    console.info(
      `[AUDIT] Repository updated by ${session.user?.login || "unknown"}: ${owner}/${repo}`,
      { updates: Object.keys(parseResult.data) }
    );

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("Forbidden")) status = 403;
    else if (message.includes("Validation failed")) status = 422;
    else if (message.includes("GitHub token")) status = 401;

    const safeMessage =
      status === 500 ? "An unexpected error occurred while updating the repository" : message;

    console.error("[API_REPO_PATCH]", error);
    return NextResponse.json<ApiError>({ error: safeMessage }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { owner, repo } = await params;

  // Validate URL parameters
  const ownerParse = ownerParamSchema.safeParse(owner);
  const repoParse = repoParamSchema.safeParse(repo);

  if (!ownerParse.success || !repoParse.success) {
    return NextResponse.json<ApiError>(
      { error: "Invalid repository path" },
      { status: 400 }
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parseResult = deleteRepoSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json<ApiError>(
      { error: "Delete confirmation required", code: parseResult.error.message },
      { status: 422 }
    );
  }

  // Double-verify that the provided name matches the URL parameter
  if (parseResult.data.name !== repo) {
    return NextResponse.json<ApiError>(
      { error: "Repository name mismatch" },
      { status: 400 }
    );
  }

  try {
    await deleteRepo(session.accessToken, owner, repo);

    console.info(
      `[AUDIT] Repository deleted by ${session.user?.login || "unknown"}: ${owner}/${repo}`
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("Forbidden")) status = 403;
    else if (message.includes("Validation failed")) status = 422;
    else if (message.includes("GitHub token")) status = 401;

    const safeMessage =
      status === 500 ? "An unexpected error occurred while deleting the repository" : message;

    console.error("[API_REPO_DELETE]", error);
    return NextResponse.json<ApiError>({ error: safeMessage }, { status });
  }
}
