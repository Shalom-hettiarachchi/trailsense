import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";

function md5(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export async function POST(req: Request) {
  await connectDB();

  try {
    // PayHere sends x-www-form-urlencoded (use formData)
    const form = await req.formData();

    const merchant_id = String(form.get("merchant_id") || "");
    const order_id = String(form.get("order_id") || "");
    const payment_id = String(form.get("payment_id") || "");
    const payhere_amount = String(form.get("payhere_amount") || "");
    const payhere_currency = String(form.get("payhere_currency") || "");
    const status_code = String(form.get("status_code") || "");
    const md5sig = String(form.get("md5sig") || "");

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) {
      return NextResponse.json({ message: "Missing PAYHERE_MERCHANT_SECRET" }, { status: 500 });
    }

    // ✅ Verify PayHere signature:
    // md5sig = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret).toUpperCase()).toUpperCase()
    const secretHash = md5(merchantSecret).toUpperCase();
    const localSig = md5(
      merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash
    ).toUpperCase();

    if (!md5sig || localSig !== md5sig) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // status_code === "2" means success in PayHere
    if (status_code === "2") {
      await Booking.findByIdAndUpdate(
        order_id, // ✅ because we used Mongo _id as order_id
        {
          $set: {
            paymentProvider: "payhere",
            paymentStatus: "paid",
            payhereOrderId: order_id,
            payherePaymentId: payment_id,
            status: "confirmed", // optional, but good for your system
          },
        },
        { new: true }
      );

      // PayHere expects HTTP 200
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    // Not success -> mark failed/unpaid
    await Booking.findByIdAndUpdate(
      order_id,
      {
        $set: {
          paymentProvider: "payhere",
          paymentStatus: "failed",
          payhereOrderId: order_id,
          payherePaymentId: payment_id,
        },
      },
      { new: true }
    );

    return NextResponse.json({ message: "NOT_SUCCESS", status_code }, { status: 200 });
  } catch (e: any) {
    // Still return 200 to avoid PayHere retries storm in some cases
    return NextResponse.json({ message: e?.message || "Notify failed" }, { status: 200 });
  }
}
