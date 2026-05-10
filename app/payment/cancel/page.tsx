"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // 1. Import Suspense
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentCancelContent() {
  const sp = useSearchParams();
  const bookingId = sp.get("bookingId");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Cancelled</CardTitle>
      </CardHeader>
      <CardContent>
        <p>You cancelled the payment. You can try again from the booking.</p>
        <p className="text-sm text-muted-foreground mt-2">Booking: {bookingId}</p>
      </CardContent>
    </Card>
  );
}

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Suspense fallback={<p className="text-center">Loading payment details...</p>}>
            <PaymentCancelContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}