import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Hike from "@/models/Hike";
import { hikes } from "@/data/hikes";
import { requireAdmin } from "@/lib/requireAdmin";

// data/hikes.ts builds image URLs with `new URL(..., import.meta.url)`, which on
// the server resolves to a file:// path inside the build that browsers can't load.
// The same images are served from /public/hikes, so store that path instead.
function toPublicImagePath(src: string): string {
  const file = src.split(/[\/]/).pop() || "";
  const clean = file.replace(/\.[0-9a-f]{8}(?=\.[a-z]+$)/i, ""); // drop build hash
  return `/hikes/${clean}`;
}

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  await connectDB();

  try {
    const docs = hikes.map((h) => ({
      slug: h.id, 
      name: h.name,
      location: h.location,
      difficulty: h.difficulty,
      duration: h.duration,
      distance: h.distance,
      bestSeason: h.bestSeason,
      description: h.description,
      fullDescription: h.fullDescription,
      imageUrl: toPublicImagePath(h.image),
      permitRequired: h.permitRequired,
      safetyTips: h.safetyTips || [],
      highlights: h.highlights || [],
      mapEmbedUrl: h.mapEmbedUrl || "",
      baseFee: Number(h.baseFee || 0),
      dropLat: Number(h.dropLat || 0),
      dropLng: Number(h.dropLng || 0),
      isActive: true,
      sortOrder: 0,
    }));

    const results = [];
    for (const d of docs) {
      const r = await Hike.updateOne({ slug: d.slug }, { $set: d }, { upsert: true });
      results.push(r);
    }

    const count = await Hike.countDocuments();
    return NextResponse.json({ message: "Seeded hikes", insertedOrUpdated: docs.length, totalInDB: count });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Seeding failed" },
      { status: 500 }
    );
  }
}
