import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import RentalItem from "@/models/RentalItem";

// GET /api/rentals?activeOnly=1
export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "1";

    const query: any = {};
    if (activeOnly) query.isActive = true;

    const items = await RentalItem.find(query).sort({ sortOrder: 1, createdAt: -1 });

    return NextResponse.json({
      items: items.map((r: any) => ({
        _id: r._id.toString(),
        sku: r.sku,
        name: r.name,
        category: r.category,
        description: r.description,
        imageUrl: r.imageUrl,
        unitPrice: r.unitPrice,
        stock: r.stock,
        isActive: r.isActive,
        sortOrder: r.sortOrder,
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to load rentals" },
      { status: 500 }
    );
  }
}

// POST /api/rentals
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));

    // basic validation
    const sku = String(body?.sku || "").trim();
    const name = String(body?.name || "").trim();
    const unitPrice = Number(body?.unitPrice || 0);

    if (!sku) return NextResponse.json({ message: "SKU is required" }, { status: 400 });
    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      return NextResponse.json({ message: "Invalid unitPrice" }, { status: 400 });
    }

    const created = await RentalItem.create({
      sku,
      name,
      category: String(body?.category || "General"),
      description: String(body?.description || ""),
      imageUrl: String(body?.imageUrl || ""),
      unitPrice,
      stock: Number(body?.stock ?? 9999),
      isActive: body?.isActive !== undefined ? Boolean(body.isActive) : true,
      sortOrder: Number(body?.sortOrder || 0),
    });

    return NextResponse.json(
      { message: "Rental created", id: created._id.toString() },
      { status: 201 }
    );
  } catch (e: any) {
    // common error: duplicate sku
    return NextResponse.json(
      { message: e?.message || "Failed to create rental" },
      { status: 500 }
    );
  }
}
