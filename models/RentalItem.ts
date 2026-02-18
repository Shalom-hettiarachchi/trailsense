import mongoose, { Schema, models } from "mongoose";

const RentalItemSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true }, // e.g. "TENT_2P"
    name: { type: String, required: true }, // "2-Person Tent"
    category: { type: String, default: "General" }, // Tent, Backpack, etc
    description: { type: String, default: "" },

    imageUrl: { type: String, default: "" },

    unitPrice: { type: Number, required: true, min: 0 }, // price per booking/day (your choice)
    stock: { type: Number, default: 9999 }, // optional
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.RentalItem || mongoose.model("RentalItem", RentalItemSchema);
