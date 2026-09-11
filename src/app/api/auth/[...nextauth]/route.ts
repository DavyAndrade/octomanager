import { handlers } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

const { GET: authGet, POST: authPost } = handlers;

export async function GET(request: NextRequest) {
  try {
    const response = (await authGet(request)) as Response;

    if (request.nextUrl.pathname.endsWith("/session")) {
      const session = (await response.json()) as Record<string, unknown>;
      const publicSession = { ...session };
      delete publicSession.accessToken;
      const headers = new Headers(response.headers);
      headers.delete("content-length");

      return new Response(JSON.stringify(publicSession), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return (await authPost(request)) as Response;
  } catch {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
}
