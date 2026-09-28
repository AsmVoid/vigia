import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "V.I.G.I.A",
    timestamp: new Date().toISOString(),
  });
}
