import { NextResponse } from "next/server";
import { readSession, updateSession } from "@/lib/store";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ session: readSession(), error: null });
}

export async function POST(request: Request) {
  const action = (await request.json()) as Action;
  const result = await updateSession(action);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}
