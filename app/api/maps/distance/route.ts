import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination } = body || {};

    // origin can be an address string, or "lat,lng"
    // destination should be { lat, lng }
    if (!origin || !destination?.lat || !destination?.lng) {
      return NextResponse.json(
        { message: "origin and destination(lat,lng) are required" },
        { status: 400 }
      );
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return NextResponse.json(
        { message: "Missing GOOGLE_MAPS_API_KEY in env" },
        { status: 500 }
      );
    }

    const origins = encodeURIComponent(String(origin));
    const destinations = encodeURIComponent(`${destination.lat},${destination.lng}`);

    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${origins}&destinations=${destinations}&key=${encodeURIComponent(key)}`;

    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();

    const el = json?.rows?.[0]?.elements?.[0];
    if (!el || el.status !== "OK") {
      return NextResponse.json(
        { message: "Could not calculate distance", raw: json },
        { status: 400 }
      );
    }

    const distanceMeters = el.distance?.value ?? 0;
    const durationSeconds = el.duration?.value ?? 0;

    const distanceKm = Math.round((distanceMeters / 1000) * 100) / 100;

    return NextResponse.json({
      distanceKm,
      durationText: el.duration?.text ?? "",
      distanceText: el.distance?.text ?? "",
      durationSeconds,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Distance calculation failed" },
      { status: 500 }
    );
  }
}
