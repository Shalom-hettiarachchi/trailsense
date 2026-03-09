import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";

function md5(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

function formatAmount(n: number) {
  const v = Number(n || 0);
  return v.toFixed(2); // PayHere expects "1234.00"
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ message: "bookingId required" }, { status: 400 });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    // MUST be a public https URL if you want notify_url to work (use ngrok in dev)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!merchantId || !merchantSecret) {
      return NextResponse.json(
        { message: "Missing PAYHERE_MERCHANT_ID or PAYHERE_MERCHANT_SECRET in env" },
        { status: 500 }
      );
    }

    const booking: any = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const amount = Number(booking.totalCost || 0);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Booking totalCost is 0. Save totalCost when creating booking." },
        { status: 400 }
      );
    }

    // CRITICAL: PayHere order_id must be your Mongo booking _id
    const orderId = booking._id.toString();

    const currency = "LKR";
    const amountStr = formatAmount(amount);

    // PayHere hash formula:
    // md5(merchant_id + order_id + amount + currency + md5(merchant_secret).toUpperCase()).toUpperCase()
    const secretHash = md5(merchantSecret).toUpperCase();
    const hash = md5(merchantId + orderId + amountStr + currency + secretHash).toUpperCase();

    const fullName = String(booking.customerName || "TrailSense User").trim();
    const parts = fullName.split(" ");
    const first_name = parts[0] || "TrailSense";
    const last_name = parts.slice(1).join(" ") || "User";

    const payload = {
      merchant_id: merchantId,
      return_url: `${appUrl}/payment/success?bookingId=${encodeURIComponent(orderId)}`,
      cancel_url: `${appUrl}/payment/cancel?bookingId=${encodeURIComponent(orderId)}`,

      // IMPORTANT: notify_url must be reachable by PayHere (NOT localhost)
      notify_url: `${appUrl}/api/payhere/notify`,

      order_id: orderId,
      items: booking.hikeName || "Hike Booking",
      currency,
      amount: amountStr,

      first_name,
      last_name,
      email: booking.customerEmail || "test@example.com",
      phone: booking.customerPhone || "0000000000",
      address: booking.pickupLocation || "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",

      hash,
    };

    return NextResponse.json({
      actionUrl: "https://sandbox.payhere.lk/pay/checkout",
      payload,
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to create checkout" },
      { status: 500 }
    );
  }
}
