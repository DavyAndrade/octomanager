import { handlers } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

const { GET: authGet, POST: authPost } = handlers;

export async function GET(request: NextRequest) {
  try {
    return (await authGet(request)) as Response;
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
