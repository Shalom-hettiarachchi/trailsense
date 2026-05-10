import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";

export async function PATCH(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      id,

      hikeDate,
      numberOfPeople,
      status,
      
      guide,
      assignedGuideId,
      transport,
      pickupLocation,

      paymentStatus,
      paymentProvider,
      payhereOrderId,
      payherePaymentId,
    } = body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking id" }, { status: 400 });
    }

    const update: any = {};

    // Assign / unassign guide
    if (assignedGuideId !== undefined) {
      update.assignedGuideId = String(assignedGuideId).trim() || null;
    }

    // Edit requested guide type
    if (guide !== undefined) {
      update.guide = String(guide).trim();
    }

    // Edit transport option
    if (transport !== undefined) {
      update.transport = String(transport).trim();
    }

    // Edit pickup location
    if (pickupLocation !== undefined) {
      update.pickupLocation = String(pickupLocation).trim();
    }

    // Edit hike date
    if (hikeDate !== undefined) {
      const d = String(hikeDate).trim();
      if (!d) {
        return NextResponse.json({ message: "hikeDate cannot be empty" }, { status: 400 });
      }
      update.hikeDate = d;
    }

    // Edit numberOfPeople
    if (numberOfPeople !== undefined) {
      const n = Number(numberOfPeople);
      if (!n || n < 1 || n > 20) {
        return NextResponse.json(
          { message: "numberOfPeople must be between 1 and 20" },
          { status: 400 }
        );
      }
      update.numberOfPeople = n;
    }

    // Status update
    if (status !== undefined) {
      const s = String(status);
      if (!["pending", "confirmed", "cancelled"].includes(s)) {
        return NextResponse.json({ message: "Invalid status" }, { status: 400 });
      }
      update.status = s;
    }

    // Payment status update
    if (paymentStatus !== undefined) {
      const ps = String(paymentStatus).trim().toLowerCase();
      if (!["paid", "unpaid", "failed"].includes(ps)) {
        return NextResponse.json(
          { message: "Invalid paymentStatus" },
          { status: 400 }
        );
      }
      update.paymentStatus = ps;
    }

    // Optional: store provider
    if (paymentProvider !== undefined) {
      update.paymentProvider = String(paymentProvider).trim();
    }

    // Optional: store PayHere refs
    if (payhereOrderId !== undefined) {
      update.payhereOrderId = String(payhereOrderId).trim();
    }
    if (payherePaymentId !== undefined) {
      update.payherePaymentId = String(payherePaymentId).trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const updated = await Booking.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Booking not found", id }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Booking updated",
        bookingId: updated._id.toString(),
        paymentStatus: updated.paymentStatus,
        status: updated.status,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { id } = body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking id" }, { status: 400 });
    }

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Booking not found", id }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Booking deleted", bookingId: deleted._id.toString() },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Delete failed" },
      { status: 500 }
    );
  }
}