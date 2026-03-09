"use client";

import { useEffect, useState, Suspense } from "react"; // Added Suspense
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatLKR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-LK")}`;
}

// 1. New component to handle the Search Params and Fetch logic
function PaymentContent() {
  const sp = useSearchParams();
  const bookingId = sp.get("bookingId");

  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [hikeName, setHikeName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!bookingId) {
          setErr("Missing bookingId");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/bookings?bookingId=${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load booking");

        const b = data?.booking;
        if (!b) throw new Error("Booking not found");

        if (!alive) return;
        setTotal(Number(b.totalCost || 0));
        setHikeName(b.hikeName || "");
        setDateTime(`${b.hikeDate || ""} • ${b.hikeTime || ""}`);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [bookingId]);

  async function payNow() {
    setErr("");
    try {
      if (!bookingId) throw new Error("Missing bookingId");

      const res = await fetch("/api/payhere/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to create checkout");

      const { actionUrl, payload } = data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = actionUrl;

      Object.entries(payload).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = String(v ?? "");
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e: any) {
      setErr(e?.message || "Failed to create checkout");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with PayHere (Sandbox)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p>Loading booking...</p>
        ) : (
          <>
            <div className="text-sm space-y-1">
              <p><b>Booking:</b> {bookingId}</p>
              <p><b>Hike:</b> {hikeName}</p>
              <p><b>Date:</b> {dateTime}</p>
            </div>

            <div className="border rounded-lg p-4 flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{formatLKR(total)}</span>
            </div>

            <Button className="w-full" size="lg" onClick={payNow} disabled={loading || total <= 0}>
              Pay Now
            </Button>

            {err && <p className="text-sm text-red-500">{err}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// 2. The Main Page component that wraps everything in Suspense
export default function PaymentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Suspense fallback={<div className="text-center">Initializing secure payment...</div>}>
            <PaymentContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}