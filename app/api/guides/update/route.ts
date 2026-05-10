import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User"; 
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  try {
    await connectDB();
    
    // Extract experienceLevel from the request body
    const { id, name, email, password, experienceLevel } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Guide ID required" }, { status: 400 });
    }

    // Prepare the update payload
    const updateData: any = { 
      fullName: name, 
      email,
      experienceLevel // Add it to the update object
    };
    
    // Only update the password if the admin typed a new one
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
      updateData.passwordHash = hashed;
    }

    const updatedGuide = await User.findOneAndUpdate(
      { _id: id, role: "guide" }, 
      updateData, 
      { new: true }
    );

    if (!updatedGuide) {
      return NextResponse.json({ message: "Guide not found or invalid permissions" }, { status: 404 });
    }

    return NextResponse.json({ message: "Guide updated successfully" }, { status: 200 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Email already in use by another user" }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Guide ID required" }, { status: 400 });
    }

    const deletedGuide = await User.findOneAndDelete({ _id: id, role: "guide" });

    if (!deletedGuide) {
      return NextResponse.json({ message: "Guide not found or invalid permissions" }, { status: 404 });
    }

    return NextResponse.json({ message: "Guide deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}