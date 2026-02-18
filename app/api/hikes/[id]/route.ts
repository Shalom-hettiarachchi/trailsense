import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  await connectDB();

  try {
    const { id } = await ctx.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    const update: any = {
      ...(body.name && { name: body.name }),
      ...(body.slug && { slug: body.slug }),
      ...(body.location && { location: body.location }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.duration && { duration: body.duration }),
      ...(body.distance && { distance: body.distance }),
      ...(body.bestSeason && { bestSeason: body.bestSeason }),
      ...(body.description && { description: body.description }),
      ...(body.fullDescription && { fullDescription: body.fullDescription }),
      ...(body.imageUrl && { imageUrl: body.imageUrl }),

      ...(body.baseFee !== undefined && { baseFee: Number(body.baseFee) }),
      ...(body.dropLat !== undefined && { dropLat: Number(body.dropLat) }),
      ...(body.dropLng !== undefined && { dropLng: Number(body.dropLng) }),

      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    };

    const updated = await Hike.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Hike not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated", hike: updated });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}
