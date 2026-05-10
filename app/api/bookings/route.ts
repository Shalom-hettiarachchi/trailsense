import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";
import { User } from "@/models/User";
import Hike from "@/models/Hike";

export async function GET(req: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const bookingId = searchParams.get("bookingId");

    // GET SINGLE BOOKING

    if (bookingId) {
      const b: any = await Booking.findById(bookingId);

      if (!b)
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 }
        );

      return NextResponse.json({
        booking: {
          _id: b._id.toString(),
          userId: b.userId,

          hikeId: b.hikeId,
          hikeName: b.hikeName,

          hikeDate: b.hikeDate,
          hikeTime: b.hikeTime,

          createdAt: b.createdAt,
          bookingDate: b.bookingDate,

          numberOfPeople: b.numberOfPeople,
          status: b.status,

          customerName: b.customerName,
          customerEmail: b.customerEmail,
          customerPhone: b.customerPhone,

          gearQty: Object.fromEntries((b.gearQty || new Map()).entries()),
          
          guide: b.guide,
          assignedGuideId: b.assignedGuideId, // ✅ ADDED HERE

          transport: b.transport,
          pickupLocation: b.pickupLocation,
          distanceKm: b.distanceKm,

          hikeFee: b.hikeFee,
          gearCost: b.gearCost,
          guideCost: b.guideCost,
          transportCost: b.transportCost,
          totalCost: b.totalCost,

          paymentProvider: b.paymentProvider,
          paymentStatus: b.paymentStatus,
          payhereOrderId: b.payhereOrderId,
          payherePaymentId: b.payherePaymentId,
        },
      });
    }

    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const query: any = {};

    if (userId) query.userId = userId;

    if (status) {
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return NextResponse.json(
          { message: "Invalid status" },
          { status: 400 }
        );
      }

      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    // RETURN BOOKINGS LIST

    return NextResponse.json({
      bookings: bookings.map((b: any) => ({
        _id: b._id.toString(),
        userId: b.userId,

        hikeId: b.hikeId,
        hikeName: b.hikeName,

        hikeDate: b.hikeDate,
        hikeTime: b.hikeTime,

        bookingDate: b.bookingDate,
        createdAt: b.createdAt,

        numberOfPeople: b.numberOfPeople,
        status: b.status,

        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,

        gearQty: Object.fromEntries((b.gearQty || new Map()).entries()),
        
        guide: b.guide,
        assignedGuideId: b.assignedGuideId, // ✅ ADDED HERE

        transport: b.transport,
        pickupLocation: b.pickupLocation,
        distanceKm: b.distanceKm,

        // ⭐ IMPORTANT (FOR ADMIN + GUIDE DASHBOARDS)
        hikeFee: b.hikeFee,
        gearCost: b.gearCost,
        guideCost: b.guideCost,
        transportCost: b.transportCost,

        totalCost: b.totalCost,

        paymentStatus: b.paymentStatus,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Failed to load bookings" },
      { status: 500 }
    );
  }
}

// ============================
// CREATE BOOKING
// ============================

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      userId,
      hikeId,
      hikeDate,
      hikeTime,
      groupSize,

      permitName,
      permitEmail,

      contactPhone,

      guide,
      transport,
      pickupLocation,

      distanceKm,
      transportCost,

      priceBreakdown,
      gearQty,
    } = body || {};

    if (!userId || !String(userId).trim()) {
      return NextResponse.json(
        { message: "Login required" },
        { status: 401 }
      );
    }

    if (!hikeId)
      return NextResponse.json(
        { message: "Please select a hike" },
        { status: 400 }
      );

    if (!hikeDate)
      return NextResponse.json(
        { message: "Please select a date" },
        { status: 400 }
      );

    if (!hikeTime)
      return NextResponse.json(
        { message: "Please select a time" },
        { status: 400 }
      );

    if (!contactPhone || !String(contactPhone).trim()) {
      return NextResponse.json(
        { message: "Please enter your contact number" },
        { status: 400 }
      );
    }

    const size = Number(groupSize);

    if (!size || size < 1 || size > 20) {
      return NextResponse.json(
        { message: "Group size must be between 1 and 20" },
        { status: 400 }
      );
    }

    const hikeIdStr = String(hikeId).trim();

    let hike: any = null;

    if (mongoose.Types.ObjectId.isValid(hikeIdStr)) {
      hike = await Hike.findById(hikeIdStr);
    }

    if (!hike) {
      hike = await Hike.findOne({ slug: hikeIdStr });
    }

    if (!hike) {
      hike = await Hike.findOne({ name: hikeIdStr });
    }

    if (!hike || hike.isActive === false) {
      return NextResponse.json(
        { message: "Invalid hike selected" },
        { status: 400 }
      );
    }

    const userDoc = await User.findById(userId).select("fullName email");

    if (!userDoc) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    const fallbackName = userDoc.fullName || "Explorer";
    const fallbackEmail = userDoc.email || "";

    const t = transport || "none";

    const hikeFee = Number(
      priceBreakdown?.hikeBaseFee ?? body?.hikeFee ?? hike?.baseFee ?? 0
    );

    const gearCost = Number(
      priceBreakdown?.rentalsFee ?? body?.gearCost ?? 0
    );

    const guideCost = Number(
      priceBreakdown?.guideFee ?? body?.guideCost ?? 0
    );

    const tCost = Number(
      priceBreakdown?.transportCost ?? transportCost ?? 0
    );

    const totalCost = Number(
      priceBreakdown?.total ??
        body?.totalCost ??
        hikeFee + gearCost + guideCost + tCost
    );

    const booking = await Booking.create({
      userId,

      hikeId: hike.slug || hikeIdStr,
      hikeName: hike.name,

      hikeDate,
      hikeTime,

      bookingDate: new Date(),

      numberOfPeople: size,

      customerName: (permitName && permitName.trim()) || fallbackName,
      customerEmail: (permitEmail && permitEmail.trim()) || fallbackEmail,
      customerPhone: String(contactPhone).trim(),

      gearQty: gearQty && typeof gearQty === "object" ? gearQty : {},

      guide: guide || "none",
      
      assignedGuideId: null,

      transport: t,
      pickupLocation: pickupLocation || "",

      distanceKm: Number(distanceKm || 0),

      hikeFee,
      gearCost,
      guideCost,
      transportCost: tCost,

      totalCost,

      status: "pending",

      paymentProvider: "payhere",
      paymentStatus: "unpaid",
    });

    return NextResponse.json(
      { message: "Booking created", bookingId: booking._id.toString() },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}