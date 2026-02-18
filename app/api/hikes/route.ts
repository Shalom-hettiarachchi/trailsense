import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";

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
        _id: h._id.toString(),
        slug: h.slug,
        name: h.name,
        location: h.location,
        difficulty: h.difficulty,
        duration: h.duration,
        distance: h.distance,
        bestSeason: h.bestSeason,
        description: h.description,
        fullDescription: h.fullDescription,
        imageUrl: h.imageUrl,
        permitRequired: h.permitRequired,
        safetyTips: h.safetyTips,
        highlights: h.highlights,
        mapEmbedUrl: h.mapEmbedUrl,
        baseFee: h.baseFee,
        dropLat: h.dropLat,
        dropLng: h.dropLng,
        isActive: h.isActive,
        sortOrder: h.sortOrder,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to load hikes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    if (!body?.slug?.trim()) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }
    if (!body?.name?.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const created = await Hike.create(body);

    return NextResponse.json(
      { message: "Hike created", id: created._id.toString() },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to create hike" },
      { status: 500 }
    );
  }
}
