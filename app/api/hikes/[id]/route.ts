import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";

/**
 * GET: Fetch a single hike by its MongoDB ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const hike = await Hike.findById(id);

    if (!hike) {
      return NextResponse.json(
        { message: "Hike not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ hike });
  } catch (err: any) {
    console.error("GET Hike Error:", err);
    return NextResponse.json(
      { message: "Failed to fetch hike", error: err.message }, 
      { status: 500 }
    );
  }
}

/**
 * PUT: Update an existing hike
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const updatedHike = await Hike.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedHike) {
      return NextResponse.json(
        { message: "Hike not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Hike updated successfully", 
      hike: updatedHike 
    });
  } catch (err: any) {
    console.error("PUT Hike Error:", err);
    return NextResponse.json(
      { message: "Failed to update hike", error: err.message }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a hike from the database
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedHike = await Hike.findByIdAndDelete(id);

    if (!deletedHike) {
      return NextResponse.json(
        { message: "Hike not found or already deleted" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "Hike deleted successfully",
      id: id 
    });
  } catch (err: any) {
    console.error("DELETE Hike Error:", err);
    return NextResponse.json(
      { message: "Failed to delete hike", error: err.message }, 
      { status: 500 }
    );
  }
}