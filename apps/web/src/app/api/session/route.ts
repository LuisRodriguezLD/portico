import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    demo: "The afternoon is stored in this browser. No student records leave the page.",
  });
}
