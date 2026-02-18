import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import RentalItem from "@/models/RentalItem";

export async function POST() {
  await connectDB();

  const items = [
    {
      sku: "TENT_2P",
      name: "Professional Hiking Tent",
      category: "Tent",
      description: "4-season waterproof tent for 2-3 people",
      imageUrl: "/rentals/tent.jpg",
      unitPrice: 2000,
    },
    {
      sku: "BACKPACK_60L",
      name: "Hiking Backpack 60L",
      category: "Backpack",
      description: "Large capacity backpack with rain cover",
      imageUrl: "/rentals/backpack.jpg",
      unitPrice: 1200,
    },
    {
      sku: "POLES_PAIR",
      name: "Trekking Poles (Pair)",
      category: "Accessories",
      description: "Adjustable aluminum poles with shock absorption",
      imageUrl: "/rentals/poles.jpg",
      unitPrice: 650,
    },
    {
      sku: "BOOTS_STD",
      name: "Hiking Boots",
      category: "Footwear",
      description: "Waterproof ankle-support boots",
      imageUrl: "/rentals/boots.jpg",
      unitPrice: 950,
    },
  ];

  for (const item of items) {
    await RentalItem.updateOne(
      { sku: item.sku },
      { $set: { ...item, isActive: true } },
      { upsert: true }
    );
  }

  const count = await RentalItem.countDocuments();

  return NextResponse.json({
    message: "Rentals seeded",
    total: count,
  });
}
