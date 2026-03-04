import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getToken } from "next-auth/jwt";
import { listRepos } from "@/lib/octokit";
import { repoListParamsSchema } from "@/schemas/repo";
import type { ApiError } from "@/types/api";

export async function GET(request: Request): Promise<NextResponse> {
  const [session, token] = await Promise.all([
    auth(),
    getToken({ req: request }),
  ]);
  const accessToken = token?.accessToken as string | undefined;

  if (!session || !accessToken) {
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
    const result = await listRepos(accessToken, parseResult.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch repositories";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
