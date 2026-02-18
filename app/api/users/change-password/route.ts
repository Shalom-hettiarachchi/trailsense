import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

// Same note as above: replace userId passing with real session auth if you have it.
export async function PATCH(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { userId, currentPassword, newPassword } = body || {};

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const np = String(newPassword);
    if (np.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await User.findById(userId).select("+password fullName email");
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const ok = await bcrypt.compare(String(currentPassword), user.password);
    if (!ok) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(np, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Password change failed" }, { status: 500 });
  }
}
