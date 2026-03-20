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
    return NextResponse.json({ data: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update repository";
    const status = message.includes("not found")
      ? 404
      : message.includes("Forbidden")
        ? 403
        : 500;
    return NextResponse.json<ApiError>({ error: message }, { status });
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
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete repository";
    const status = message.includes("not found")
      ? 404
      : message.includes("Forbidden")
        ? 403
        : 500;
    return NextResponse.json<ApiError>({ error: message }, { status });
  }
}
