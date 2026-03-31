import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch only users who have the "guide" role
    const users = await User.find({ role: "guide" }).sort({ createdAt: -1 });
    
    // Map the fields so the frontend table sees what it expects
    const guides = users.map(u => ({
      _id: u._id,
      name: u.fullName || "Unknown", 
      email: u.email,
      // Add experienceLevel with a fallback
      experienceLevel: u.experienceLevel || "basic" 
    }));

    return NextResponse.json({ guides });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // Extract the new experienceLevel field from the request body
    const { name, email, password, experienceLevel } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    // Check if user already exists to prevent duplicate email crashes
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user as a guide, mapping all fields
    const newGuide = await User.create({ 
      fullName: name, 
      email, 
      password: hashedPassword,     
      passwordHash: hashedPassword, 
      role: "guide",
      // Save the experience level (defaulting to basic if none provided)
      experienceLevel: experienceLevel || "basic"
    });

    return NextResponse.json({ message: "Guide created successfully", guide: newGuide }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}