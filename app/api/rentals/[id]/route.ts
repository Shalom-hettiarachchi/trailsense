import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import RentalItem from "@/models/RentalItem";

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

    // ✅ force correct types
    const update: any = {
      ...(body.sku !== undefined && { sku: String(body.sku) }),
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.category !== undefined && { category: String(body.category) }),
      ...(body.description !== undefined && { description: String(body.description) }),
      ...(body.imageUrl !== undefined && { imageUrl: String(body.imageUrl) }),

      ...(body.unitPrice !== undefined && { unitPrice: Number(body.unitPrice) }),
      ...(body.stock !== undefined && { stock: Number(body.stock) }),

      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    };

    const updated = await RentalItem.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Rental not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated", item: updated });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}
