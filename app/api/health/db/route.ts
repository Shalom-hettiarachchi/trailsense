import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  await connectDB();
  return NextResponse.json({ ok: true, db: "connected" });
}
