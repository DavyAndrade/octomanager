import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { updateRepo, deleteRepo } from "@/lib/octokit";
import { updateRepoSchema } from "@/schemas/repo";
import type { ApiError } from "@/types/api";

interface RouteContext {
  params: Promise<{ owner: string; repo: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const token = await getToken({ req: request });

  if (!token?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { owner, repo } = await params;
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
      token.accessToken as string,
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
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const token = await getToken({ req: request });

  if (!token?.accessToken) {
    return NextResponse.json<ApiError>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { owner, repo } = await params;

  try {
    await deleteRepo(token.accessToken as string, owner, repo);
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
