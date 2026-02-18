import mongoose, { Schema, models, model } from "mongoose";

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    hikeId: { type: String, required: true },
    hikeName: { type: String, required: true },

    hikeDate: { type: String, required: true },
    hikeTime: { type: String, required: true },

    bookingDate: { type: Date, default: Date.now },
    numberOfPeople: { type: Number, required: true, min: 1, max: 20 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },

    // Rentals
    // gearQty example: { Tent: 2, boots: 1 }
    gearQty: {
      type: Map,
      of: Number,
      default: {},
    },

    guide: { type: String, default: "none" },

    // Transport
    transport: { type: String, default: "none" },
    pickupLocation: { type: String, default: "" },
    distanceKm: { type: Number, default: 0 },

    // Pricing
    hikeFee: { type: Number, default: 0 },
    gearCost: { type: Number, default: 0 },
    guideCost: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },

    // Payment (PayHere)
    paymentProvider: { type: String, default: "none" }, // "payhere"
    paymentStatus: { type: String, default: "unpaid" }, // unpaid | paid | failed
    payhereOrderId: { type: String, default: "" },
    payherePaymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

const Booking = models.Booking || model("Booking", BookingSchema);
export default Booking;
