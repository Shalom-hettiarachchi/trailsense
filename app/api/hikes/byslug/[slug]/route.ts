import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";

export async function GET(
  req: Request,
  // Next.js 15+ requires params to be a Promise
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await ctx.params; 

    // Use a case-insensitive search to be safe
    const hike = await Hike.findOne({ 
      slug: { $regex: new RegExp(`^${slug}$`, 'i') } 
    });

    if (!hike) {
      // Return JSON even for 404s so the frontend doesn't crash
      return NextResponse.json({ hike: null, message: "Hike not found" }, { status: 404 });
    }

    return NextResponse.json({ hike });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}