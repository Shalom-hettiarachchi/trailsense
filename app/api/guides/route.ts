import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User"; // Named import to fix the "Export default doesn't exist" error
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    // Fetch only users who have the "guide" role
    const users = await User.find({ role: "guide" }).sort({ createdAt: -1 });
    
    // Map the fields so the frontend table still sees "name" and "email"
    const guides = users.map(u => ({
      _id: u._id,
      name: u.fullName || u.name || "Unknown", // Failsafe mapped to your schema
      email: u.email
    }));

    return NextResponse.json({ guides });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user as a guide, satisfying BOTH required password fields
    const newGuide = await User.create({ 
      fullName: name, 
      email, 
      password: hashedPassword,     // Satisfies the 'password' requirement
      passwordHash: hashedPassword, // Satisfies the 'passwordHash' requirement
      role: "guide" 
    });

    return NextResponse.json({ message: "Guide created", guide: newGuide });
  } catch (error: any) {
    // Handle duplicate email errors from MongoDB
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}