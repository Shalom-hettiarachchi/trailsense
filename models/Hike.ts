import mongoose, { Schema, models } from "mongoose";

const HikeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // e.g. "knuckles-5-peaks"
    name: { type: String, required: true },
    location: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard", "Expert"],
      required: true,
    },

    duration: { type: String, required: true },
    distance: { type: String, required: true },
    bestSeason: { type: String, required: true },

    description: { type: String, required: true },
    fullDescription: { type: String, required: true },

    imageUrl: { type: String, required: true }, // store URL string
    permitRequired: { type: Boolean, default: false },

    safetyTips: { type: [String], default: [] },
    highlights: { type: [String], default: [] },

    mapEmbedUrl: { type: String, default: "" },

    baseFee: { type: Number, required: true, min: 0 },

    dropLat: { type: Number, required: true },
    dropLng: { type: Number, required: true },

    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Hike || mongoose.model("Hike", HikeSchema);
