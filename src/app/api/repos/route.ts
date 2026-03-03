import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { listRepos } from "@/lib/octokit";
import { repoListParamsSchema } from "@/schemas/repo";
import type { ApiError } from "@/types/api";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req: request });

  if (!token?.accessToken) {
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
    const result = await listRepos(token.accessToken as string, parseResult.data);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch repositories";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
