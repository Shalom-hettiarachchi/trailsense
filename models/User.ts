// models/User.ts (or wherever your User model is located)
import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin", "guide"], default: "user" },
    experienceLevel: { type: String, enum: ["basic", "expert"], default: "basic" },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);