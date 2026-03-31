import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getUserIdFromCookieToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromCookieToken();
    
    // ✅ CHANGED: Return 200 OK with user: null to prevent console errors
    if (!userId) return NextResponse.json({ user: null }, { status: 200 });

    await connectDB();

    const user = await User.findById(userId).select("-passwordHash");
    
    // ✅ CHANGED: Return 200 OK here as well
    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    return NextResponse.json({
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    }, { status: 200 });
  } catch {
    // ✅ CHANGED: And here
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getUserIdFromCookieToken();
    // Keep 401 here because modifying data without logging in IS a hard error
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const { fullName, email } = body || {};

    const update: any = {};

    if (fullName !== undefined) {
      const n = String(fullName).trim();
      if (!n) return NextResponse.json({ message: "Name required" }, { status: 400 });
      update.fullName = n;
    }

    if (email !== undefined) {
      const e = String(email).trim().toLowerCase();
      if (!e) return NextResponse.json({ message: "Email required" }, { status: 400 });
      update.email = e;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    // optional: prevent duplicate emails
    if (update.email) {
      const exists = await User.findOne({ email: update.email, _id: { $ne: userId } }).select("_id");
      if (exists) return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select("fullName email role");

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Update failed" }, { status: 500 });
  }
}