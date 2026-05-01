import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";

// 1. GET ALL HIKES
export async function GET(req: Request) {
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "1";

    const query: any = {};
    if (activeOnly) query.isActive = true;

    const hikes = await Hike.find(query).sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({
      hikes: hikes.map((h: any) => ({
        ...h._doc, // Spreads all fields from the document
        _id: h._id.toString(),
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to load hikes" },
      { status: 500 }
    );
  }
}

// 2. CREATE NEW HIKE
export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();

    // Check for duplicate slugs before attempting creation
    const existing = await Hike.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ message: "A hike with this slug already exists" }, { status: 400 });
    }

    const created = await Hike.create(body);

    return NextResponse.json(
      { message: "Hike created successfully", id: created._id.toString() },
      { status: 201 }
    );
  } catch (e: any) {
    // If Mongoose validation fails, this returns the specific missing field names
    console.error("Mongoose Error:", e);
    return NextResponse.json(
      { message: e?.message || "Validation failed: Check all required fields" },
      { status: 400 } // Changed to 400 as this is usually a user-input validation issue
    );
  }
}