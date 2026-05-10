import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend"; // 1. Import Resend
import { connectDB } from "@/lib/mongoose";
import Booking from "@/models/Booking";

const resend = new Resend(process.env.RESEND_API_KEY);

function md5(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export async function POST(req: Request) {
  await connectDB();

  try {
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

    const secretHash = md5(merchantSecret).toUpperCase();
    const localSig = md5(
      merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash
    ).toUpperCase();

    if (!md5sig || localSig !== md5sig) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    if (status_code === "2") {
      const updatedBooking = await Booking.findByIdAndUpdate(
        order_id,
        {
          $set: {
            paymentProvider: "payhere",
            paymentStatus: "paid",
            payhereOrderId: order_id,
            payherePaymentId: payment_id,
            status: "confirmed",
          },
        },
        { new: true }
      );

      if (updatedBooking) {
        await resend.emails.send({
          from: "TrailSense <onboarding@resend.dev>",
          to: updatedBooking.customerEmail,
          subject: `Hike Confirmed: ${updatedBooking.hikeName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h1 style="color: #15803d; text-align: center;">Booking Confirmed!</h1>
              <p>Hi ${updatedBooking.customerName},</p>
              <p>Your adventure is officially planned! We have received your payment for the <strong>${updatedBooking.hikeName}</strong> trek.</p>
              
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Hike Date:</strong> ${updatedBooking.hikeDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${updatedBooking.hikeTime}</p>
                <p style="margin: 5px 0;"><strong>Group Size:</strong> ${updatedBooking.numberOfPeople} person(s)</p>
                <p style="margin: 5px 0;"><strong>Total Paid:</strong> Rs. ${updatedBooking.totalCost.toLocaleString()}</p>
              </div>

              <p>Your booking ID is: <code>${updatedBooking._id}</code></p>
              <p>If you have any questions, please contact us at ${updatedBooking.customerPhone}.</p>
              <p style="text-align: center; margin-top: 30px; color: #64748b;">See you on the trail!<br><strong>Team TrailSense</strong></p>
            </div>
          `,
        });
      }

      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    // Handle failed payments...
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
    return NextResponse.json({ message: e?.message || "Notify failed" }, { status: 200 });
  }
}