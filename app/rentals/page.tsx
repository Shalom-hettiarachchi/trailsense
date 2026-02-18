"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RentalDTO = {
  _id: string;
  sku?: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  unitPrice: number;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

function formatLKR(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}/day`;
}

export default function RentalsPage() {
  const [items, setItems] = useState<RentalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/rentals", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load rentals");

        // ✅ Accept multiple possible response shapes
        const list: any[] =
          (Array.isArray(data?.rentals) && data.rentals) ||
          (Array.isArray(data?.items) && data.items) ||
          (Array.isArray(data?.rentalItems) && data.rentalItems) ||
          (Array.isArray(data?.data) && data.data) ||
          [];

        // ✅ Missing isActive = treat as active
        const cleaned = list
          .filter((x) => x?.isActive !== false)
          .sort((a, b) => (Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0)));

        if (!alive) return;
        setItems(cleaned);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load rentals");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-nature py-12 md:py-16 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gear Rentals</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Don&apos;t have all the equipment? No problem. Rent high-quality hiking gear
            for your adventure at affordable rates.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gradient-soft flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-bold mb-2">Rental Information</h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All equipment is sanitized and inspected before each rental</li>
              <li>• Multi-day discounts available (10% off for 3+ days)</li>
              <li>• Damage deposit required (refundable upon return)</li>
              <li>• Free delivery for orders over LKR 3,000</li>
            </ul>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="text-center text-muted-foreground py-10">
              Loading rental items...
            </div>
          )}

          {!loading && err && (
            <div className="text-center py-10">
              <p className="text-red-500 text-sm">{err}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Check your <b>/api/rentals</b> route response and DB connection.
              </p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Grid */}
          {!loading && !err && (
            <>
              {hasItems ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <Card
                      key={item._id}
                      className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <Image
                          src={item.imageUrl || "/rentals/rental-tent.jpg"} // fallback
                          alt={item.name}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          priority={false}
                        />
                      </div>

                      <CardHeader>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {item.description || "High-quality rental gear for your hike."}
                        </p>
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <Badge variant="secondary" className="text-base font-semibold">
                            {formatLKR(item.unitPrice || 0)}
                          </Badge>

                          {item.category ? (
                            <Badge variant="outline">{item.category}</Badge>
                          ) : null}
                        </div>

                        <div className="text-sm text-muted-foreground space-y-1">
                          {typeof item.stock === "number" && (
                            <div className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">✓</span>
                              <span>Stock: {item.stock}</span>
                            </div>
                          )}
                          {item.sku && (
                            <div className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">✓</span>
                              <span>SKU: {item.sku}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Sanitized & inspected</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>Daily rental pricing</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button
                          variant="adventure"
                          className="w-full"
                          onClick={() => {
                            // send them to planner rentals step (or just planner)
                            window.location.href = "/planner";
                          }}
                        >
                          Add to Booking
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">
                  No rental items available right now.
                </p>
              )}

              <div className="mt-12 text-center">
                <Card className="max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-4">Need Help Choosing?</h3>
                    <p className="text-muted-foreground mb-6">
                      Not sure what equipment you need? Our team can help you select the right
                      gear based on your chosen trail and experience level.
                    </p>
                    <Button variant="hero" size="lg">
                      Contact Our Gear Experts
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
