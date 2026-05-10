import { NextResponse } from "next/server";
import crypto from "crypto";

function md5(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { order_id, amount, currency } = await req.json();

    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchant_id || !merchant_secret) {
      return NextResponse.json(
        { message: "Missing PAYHERE_MERCHANT_ID or PAYHERE_MERCHANT_SECRET" },
        { status: 500 }
      );
    }

    if (!order_id || amount == null || !currency) {
      return NextResponse.json(
        { message: "order_id, amount, currency are required" },
        { status: 400 }
      );
    }

    const amountStr = Number(amount).toFixed(2);

    // hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
    // per PayHere docs :contentReference[oaicite:6]{index=6}
    const hash = md5(
      merchant_id + order_id + amountStr + currency + md5(merchant_secret).toUpperCase()
    ).toUpperCase();

    return NextResponse.json({ hash, merchant_id, amount: amountStr });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to generate hash" },
      { status: 500 }
    );
  }
}
