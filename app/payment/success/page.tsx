"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  CheckCircle2,
  Receipt,
  CalendarDays,
  Users,
  MapPin,
  Car,
  Tent,
  User,
  ArrowRight,
} from "lucide-react";

function formatLKR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-LK")}`;
}

function isObjectId(v: string) {
  return /^[a-f\d]{24}$/i.test(v);
}

type BookingDTO = {
  _id: string;
  hikeName: string;
  hikeDate: string;
  hikeTime: string;
  numberOfPeople: number;
  pickupLocation?: string;
  transport?: string;

  totalCost?: number;
  hikeFee?: number;
  guideCost?: number;
  gearCost?: number;
  transportCost?: number;
  distanceKm?: number;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  status?: string;
  paymentStatus?: string;

  payhereOrderId?: string;
  payherePaymentId?: string;
};

export default function PaymentSuccessPage() {
  const sp = useSearchParams();

  // Raw values from URL
  const rawBookingId = sp.get("bookingId") || "";
  const rawOrderId = sp.get("order_id") || "";
  const paymentId = sp.get("payment_id") || "";
  const statusCode = sp.get("status_code") || ""; // PayHere: 2 = success

  // ✅ IMPORTANT: only accept MongoDB ids
  const bookingId =
    (rawBookingId && isObjectId(rawBookingId) ? rawBookingId : "") ||
    (rawOrderId && isObjectId(rawOrderId) ? rawOrderId : "");

  // Prevent double patch
  const patchedOnceRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [booking, setBooking] = useState<BookingDTO | null>(null);

  const isSuccess = useMemo(() => {
    // status_code=2 is the main signal
    // payment_id exists is fallback
    return statusCode === "2" || !!paymentId;
  }, [statusCode, paymentId]);

  const paidTag = useMemo(() => {
    if (isSuccess) return "Paid";
    if (statusCode) return `Status ${statusCode}`;
    return "Success";
  }, [isSuccess, statusCode]);

  async function fetchBooking(id: string) {
    const res = await fetch(`/api/bookings?bookingId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load booking");
    return data?.booking as BookingDTO;
  }

  async function markPaidInDB(id: string) {
    console.log("PATCHING PAID FOR:", id);

    const res = await fetch("/api/bookings/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        paymentStatus: "paid",
        status: "confirmed",
        paymentProvider: "payhere",
        payhereOrderId: rawOrderId || id,
        payherePaymentId: paymentId || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    console.log("PATCH RESULT:", res.status, data);

    if (!res.ok) {
      throw new Error(data?.message || `Failed to mark paid (${res.status})`);
    }
  }

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr("");
      setNote("");

      try {
        if (!bookingId) {
          setNote(
            "Payment succeeded, but bookingId is missing/invalid in the URL. " +
              "Make sure return_url includes ?bookingId=<MongoId> or PayHere order_id is set to the MongoId."
          );
          return;
        }

        const b1 = await fetchBooking(bookingId);
        if (!alive) return;
        setBooking(b1);

        const alreadyPaid = String(b1?.paymentStatus || "").toLowerCase() === "paid";

        if (isSuccess && !alreadyPaid && !patchedOnceRef.current) {
          patchedOnceRef.current = true;

          try {
            await markPaidInDB(bookingId);
            const b2 = await fetchBooking(bookingId);
            if (!alive) return;
            setBooking(b2);
          } catch (e: any) {
            if (!alive) return;
            setNote(
              e?.message ||
                "Payment succeeded, but we couldn't update booking payment status in DB."
            );
          }
        }
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, isSuccess]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8" />
                  <div>
                    <h1 className="text-2xl font-bold">Payment Successful</h1>
                    <p className="text-white/90 text-sm">
                      Your booking is confirmed. See details below.
                    </p>
                  </div>
                </div>

                <Badge className="bg-white/15 text-white border border-white/20">
                  {paidTag}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Top meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Booking ID
                  </p>
                  <p className="font-semibold break-all">{bookingId || "—"}</p>
                  {!bookingId && (
                    <p className="text-xs text-red-500 mt-2">
                      Invalid/missing bookingId in URL.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    Payment ID
                  </p>
                  <p className="font-semibold break-all">{paymentId || "—"}</p>
                </div>
              </div>

              {/* Booking info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading && (
                    <p className="text-sm text-muted-foreground">
                      Loading booking details…
                    </p>
                  )}

                  {err && (
                    <p className="text-sm text-red-500">
                      {err}
                      <br />
                      (You can still go to Dashboard.)
                    </p>
                  )}

                  {note && !err && (
                    <p className="text-sm text-amber-600">{note}</p>
                  )}

                  {!loading && !err && (
                    <>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="secondary" className="gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {booking?.hikeDate || "—"} • {booking?.hikeTime || "—"}
                        </Badge>

                        <Badge variant="secondary" className="gap-2">
                          <Users className="h-4 w-4" />
                          {booking?.numberOfPeople ?? "—"} people
                        </Badge>

                        <Badge variant="secondary" className="gap-2">
                          <MapPin className="h-4 w-4" />
                          {booking?.hikeName || "—"}
                        </Badge>

                        <Badge
                          variant={
                            String(booking?.paymentStatus || "").toLowerCase() === "paid"
                              ? "default"
                              : "outline"
                          }
                          className="gap-2"
                        >
                          Payment: {booking?.paymentStatus || "—"}
                        </Badge>
                      </div>

                      <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Hike Fee</span>
                          <b>{formatLKR(booking?.hikeFee || 0)}</b>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" /> Guide
                          </span>
                          <b>{formatLKR(booking?.guideCost || 0)}</b>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Tent className="h-4 w-4" /> Rentals
                          </span>
                          <b>{formatLKR(booking?.gearCost || 0)}</b>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Car className="h-4 w-4" /> Transport
                          </span>
                          <b>{formatLKR(booking?.transportCost || 0)}</b>
                        </div>

                        <div className="border-t pt-3 flex items-center justify-between">
                          <span className="font-semibold">Total Paid</span>
                          <span className="font-bold text-emerald-700">
                            {formatLKR(booking?.totalCost || 0)}
                          </span>
                        </div>

                        {booking?.pickupLocation && (
                          <p className="text-xs text-muted-foreground pt-2">
                            Pickup: {booking.pickupLocation}
                            {typeof booking?.distanceKm === "number" && booking.distanceKm > 0
                              ? ` • ${booking.distanceKm.toFixed(1)} km one-way`
                              : ""}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
