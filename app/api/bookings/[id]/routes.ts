import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";


type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  await connectDB();

  console.log("PATCH DB:", mongoose.connection.name);

  try {
    const bookingId = params.id;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ message: "Invalid booking id" }, { status: 400 });
    }

    const body = await req.json();
    const update: any = {};

    // Edit fields
    if (body.hikeDate !== undefined) {
      const hikeDate = String(body.hikeDate).trim();
      if (!hikeDate) {
        return NextResponse.json({ message: "hikeDate cannot be empty" }, { status: 400 });
      }
      update.hikeDate = hikeDate;
    }

    if (body.numberOfPeople !== undefined) {
      const n = Number(body.numberOfPeople);
      if (!n || n < 1 || n > 20) {
        return NextResponse.json(
          { message: "numberOfPeople must be between 1 and 20" },
          { status: 400 }
        );
      }
      update.numberOfPeople = n;
    }

    // Cancel / status update
    if (body.status !== undefined) {
      const s = String(body.status);
      if (!["pending", "confirmed", "cancelled"].includes(s)) {
        return NextResponse.json({ message: "Invalid status" }, { status: 400 });
      }
      update.status = s;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      // If this happens, it means bookingId isn't in THIS DB
      return NextResponse.json(
        { message: "Booking not found in current DB", bookingId },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Booking updated",
      booking: {
        _id: updated._id.toString(),
        hikeId: updated.hikeId,
        hikeName: updated.hikeName,
        hikeDate: updated.hikeDate,
        numberOfPeople: updated.numberOfPeople,
        status: updated.status,
      },
    });
  } catch (err: any) {
    console.error("PATCH booking error:", err);
    return NextResponse.json(
      { message: err?.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}


export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const booking = await Booking.findById(params.id);
  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      _id: booking._id.toString(),
      hikeName: booking.hikeName,
      hikeDate: booking.hikeDate,
      hikeTime: booking.hikeTime,
      numberOfPeople: booking.numberOfPeople,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      transport: booking.transport,
      pickupLocation: booking.pickupLocation,
      priceBreakdown: booking.priceBreakdown || {},
      paymentStatus: booking.paymentStatus || "unpaid",
    },
  });
}
