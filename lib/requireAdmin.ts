import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

/**
 * Guards admin-only API routes.
 * Returns null when the request comes from a signed-in admin,
 * otherwise a 401/403 response that the route should return as-is.
 *
 * The role is read from the database rather than trusted from the token,
 * so demoting a user takes effect immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = await verifyToken(token));
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(userId).select("role");
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return null;
}
