import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User"; // Named import
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, name, email, password } = await req.json();

    if (!id) return NextResponse.json({ message: "Guide ID required" }, { status: 400 });

    // Map frontend "name" back to "fullName"
    const updateData: any = { fullName: name, email };
    
    // Only update the password if the admin typed a new one in the dashboard
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
      updateData.passwordHash = hashed;
    }

    await User.findByIdAndUpdate(id, updateData);
    return NextResponse.json({ message: "Guide updated" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ message: "Guide ID required" }, { status: 400 });

    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "Guide deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}