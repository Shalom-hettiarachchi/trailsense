import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role"); 

  const query: any = {};
  if (role) query.role = role;

  const users = await User.find(query)
    .select("_id fullName email role")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    users: users.map((u: any) => ({
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email,
      role: u.role,
    })),
  });
}
