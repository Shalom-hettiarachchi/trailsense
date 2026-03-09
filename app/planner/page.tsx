"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import PickupAutocomplete from "@/components/PickupAutocomplete";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const steps = [
  { id: 1, name: "Select Hike" },
  { id: 2, name: "Permit Details" },
  { id: 3, name: "Rentals & Gear" },
  { id: 4, name: "Guide Selection" },
  { id: 5, name: "Transport" },
  { id: 6, name: "Review & Confirm" },
];

// Transport options (still static)
const transportOptions = [
  {
    id: "none",
    title: "Self",
    subtitle: "You arrange your own ride",
    rate: 0,
    img: "/vehicles/vehicle-self.jpg",
  },
  {
    id: "car",
    title: "Car",
    subtitle: "Rs. 80 per km (round trip)",
    rate: 80,
    img: "/vehicles/vehicle-car.jpg",
  },
  {
    id: "van",
    title: "Van",
    subtitle: "Rs. 100 per km (round trip)",
    rate: 100,
    img: "/vehicles/vehicle-van.jpg",
  },
  {
    id: "jeep",
    title: "Jeep",
    subtitle: "Rs. 90 per km (round trip)",
    rate: 90,
    img: "/vehicles/vehicle-jeep.jpg",
  },
] as const;

function formatLKR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-LK")}`;
}

type GearQty = Record<string, number>;

type HikeDTO = {
  _id: string;
  slug: string;
  name: string;
  location?: string;
  difficulty?: string;
  duration?: string;
  distance?: string;
  permitRequired?: boolean;
  baseFee?: number;
  dropLat?: number;
  dropLng?: number;
  isActive?: boolean;
};

type RentalDTO = {
  _id: string;
  sku: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  unitPrice: number;
  stock?: number;
  isActive?: boolean;
};

export default function PlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedHikeSlug = searchParams.get("hike"); // slug

  const [currentStep, setCurrentStep] = useState(1);

  const [hikes, setHikes] = useState<HikeDTO[]>([]);
  const [rentals, setRentals] = useState<RentalDTO[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [formData, setFormData] = useState({
    hikeId: preselectedHikeSlug || "", // IMPORTANT: store slug here
    hikeDate: "",
    hikeTime: "",
    contactPhone: "",

    groupSize: "1",

    // permit details
    permitName: "",
    permitEmail: "",

    // ✅ quantities per item (ex: { "TENT_2P": 2, "BOOTS_STD": 1 })
    gearQty: {} as GearQty,

    guide: "none",

    transport: "none",
    pickupLocation: "",

    distanceKm: 0,
    transportCost: 0,
  });

  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  // ✅ load hikes + rentals from DB
  useEffect(() => {
    let alive = true;

    async function loadCatalog() {
      setLoadingCatalog(true);
      setCatalogError("");

      try {
        const [hRes, rRes] = await Promise.all([
          fetch("/api/hikes?activeOnly=1&lite=1", { cache: "no-store" }),
          fetch("/api/rentals", { cache: "no-store" }),
        ]);

        const hJson = await hRes.json().catch(() => ({}));
        const rJson = await rRes.json().catch(() => ({}));

        if (!hRes.ok) throw new Error(hJson?.message || "Failed to load hikes");
        if (!rRes.ok) throw new Error(rJson?.message || "Failed to load rentals");

        if (!alive) return;

        const hikeList = Array.isArray(hJson?.hikes) ? hJson.hikes : [];
        const rentalList =
          (Array.isArray(rJson?.rentals) && rJson.rentals) ||
          (Array.isArray(rJson?.items) && rJson.items) ||
          (Array.isArray(rJson?.rentalItems) && rJson.rentalItems) ||
          (Array.isArray(rJson?.data) && rJson.data) ||
          [];


        setHikes(hikeList.filter((h: any) => h?.isActive !== false));
        setRentals(rentalList.filter((x: any) => x?.isActive !== false));
      } catch (e: any) {
        if (!alive) return;
        setCatalogError(e?.message || "Failed to load catalog");
      } finally {
        if (alive) setLoadingCatalog(false);
      }
    }

    loadCatalog();
    return () => {
      alive = false;
    };
  }, []);

  const currentHike = useMemo(() => {
    return hikes.find((h) => h.slug === formData.hikeId);
  }, [hikes, formData.hikeId]);

  // ✅ Autofill permitName/permitEmail from account
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json().catch(() => ({}));
        const me = data?.user;

        if (!alive || !me) return;

        setFormData((p) => ({
          ...p,
          permitName: p.permitName?.trim() ? p.permitName : me.fullName ?? "",
          permitEmail: p.permitEmail?.trim() ? p.permitEmail : me.email ?? "",
        }));
      } catch {
        // ignore
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ hike fee now from DB
  const hikeBaseFee = useMemo(() => {
    return Number(currentHike?.baseFee || 0);
  }, [currentHike]);

  const guideFee = useMemo(() => {
    if (formData.guide === "basic") return 3000;
    if (formData.guide === "expert") return 6000;
    return 0;
  }, [formData.guide]);

  // ✅ rentals fee from DB rentals + gearQty keyed by sku
  const rentalsFee = useMemo(() => {
    return rentals.reduce((sum, item) => {
      const qty = Number(formData.gearQty[item.sku] || 0);
      return sum + (Number(item.unitPrice || 0) * qty);
    }, 0);
  }, [rentals, formData.gearQty]);

  const totalCost = hikeBaseFee + guideFee + rentalsFee + (formData.transportCost || 0);

  const transportRates: Record<string, number> = {
    car: 80,
    jeep: 90,
    van: 100,
  };

  async function recalcTransportCost(pickup: string, transport: string) {
    setDistanceError("");
    if (!currentHike) return;

    if (!pickup.trim() || transport === "none") {
      setFormData((p) => ({ ...p, distanceKm: 0, transportCost: 0 }));
      return;
    }

    setDistanceLoading(true);
    try {
      const res = await fetch("/api/maps/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: pickup,
          destination: {
            lat: Number(currentHike.dropLat || 0),
            lng: Number(currentHike.dropLng || 0),
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to calculate distance");

      const km = Number(data.distanceKm || 0);
      const rate = transportRates[transport] || 0;

      if (!km || km <= 0) {
        throw new Error("Couldn’t calculate distance. Try a more specific pickup address.");
      }

      const roundTripKm = km * 2;
      const cost = Math.round(roundTripKm * rate);

      setFormData((p) => ({ ...p, distanceKm: km, transportCost: cost }));
    } catch (e: any) {
      setFormData((p) => ({ ...p, distanceKm: 0, transportCost: 0 }));
      setDistanceError(e?.message || "Distance calculation failed");
    } finally {
      setDistanceLoading(false);
    }
  }

  const validateStep = () => {
    setStepError("");

    if (currentStep === 1) {
      if (!formData.hikeId) return "Please select a hike.";
      if (!formData.hikeDate) return "Please select a preferred date.";
      if (!formData.hikeTime) return "Please select a preferred time.";
      if (!formData.contactPhone.trim()) return "Please enter your contact number.";

      const size = Number(formData.groupSize);
      if (!size || size < 1 || size > 20) return "Group size must be between 1 and 20.";
    }

    if (currentStep === 2 && currentHike?.permitRequired) {
      if (!formData.permitName.trim()) return "Full name is required for permit.";
      if (!formData.permitEmail.trim()) return "Email is required for permit.";
    }

    if (currentStep === 5 && formData.transport !== "none") {
      if (!formData.pickupLocation.trim()) return "Please enter pickup location.";
      if (distanceError) return distanceError;
    }

    return "";
  };

  const handleNext = () => {
    const msg = validateStep();
    if (msg) return setStepError(msg);
    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError("");
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  function setQty(itemSku: string, qty: number) {
    const safeQty = Math.max(0, Math.min(20, qty));
    setFormData((p) => {
      const next = { ...p.gearQty };
      if (safeQty <= 0) delete next[itemSku];
      else next[itemSku] = safeQty;
      return { ...p, gearQty: next };
    });
  }

  const handleProceedToPayment = async () => {
    setSubmitError("");
    setStepError("");

    const msg = (() => {
      if (!formData.hikeId) return "Please select a hike.";
      if (!formData.hikeDate) return "Please select a preferred date.";
      if (!formData.hikeTime) return "Please select a preferred time.";
      if (!formData.contactPhone.trim()) return "Please enter your contact number.";

      const size = Number(formData.groupSize);
      if (!size || size < 1 || size > 20) return "Group size must be between 1 and 20.";

      if (currentHike?.permitRequired) {
        if (!formData.permitName.trim()) return "Full name is required for permit.";
        if (!formData.permitEmail.trim()) return "Email is required for permit.";
      }

      if (formData.transport !== "none" && !formData.pickupLocation.trim()) {
        return "Please enter pickup location.";
      }

      if (formData.transport !== "none" && distanceError) {
        return distanceError;
      }

      return "";
    })();

    if (msg) return setSubmitError(msg);

    setSubmitting(true);
    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!meRes.ok) {
        router.push("/auth");
        return;
      }

      const meData = await meRes.json();
      const userId = meData?.user?.id;
      if (!userId) {
        router.push("/auth");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
          // keep price breakdown (helps admin analytics)
          priceBreakdown: {
            hikeBaseFee,
            guideFee,
            rentalsFee,
            transportCost: formData.transportCost,
            total: totalCost,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Booking failed");

      router.push(`/payment?bookingId=${encodeURIComponent(data.bookingId)}`);
    } catch (e: any) {
      setSubmitError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (loadingCatalog) {
      return (
        <div className="py-10 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin mb-2" />
          Loading hikes and rentals...
        </div>
      );
    }

    if (catalogError) {
      return (
        <div className="py-10 text-center">
          <p className="text-red-500 text-sm">{catalogError}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Check your /api/hikes and /api/rentals routes.
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label>Select Your Hike</Label>
              <Select
                value={formData.hikeId}
                onValueChange={(value) => {
                  setStepError("");
                  setFormData((p) => ({
                    ...p,
                    hikeId: value, // slug
                    distanceKm: 0,
                    transportCost: 0,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a hike" />
                </SelectTrigger>
                <SelectContent>
                  {hikes.map((hike) => (
                    <SelectItem key={hike._id} value={hike.slug}>
                      {hike.name} {hike.difficulty ? `(${hike.difficulty})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Preferred Date</Label>
                <Input
                  type="date"
                  value={formData.hikeDate}
                  onChange={(e) => setFormData((p) => ({ ...p, hikeDate: e.target.value }))}
                />
              </div>

              <div>
                <Label>Preferred Time</Label>
                <Input
                  type="time"
                  value={formData.hikeTime}
                  onChange={(e) => setFormData((p) => ({ ...p, hikeTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Group Size</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.groupSize}
                  onChange={(e) => setFormData((p) => ({ ...p, groupSize: e.target.value }))}
                />
              </div>

              <div>
                <Label>Contact Number</Label>
                <Input
                  placeholder="07X XXX XXXX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                />
              </div>
            </div>

            {currentHike && (
              <div className="p-4 bg-accent/30 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{currentHike.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentHike.duration || "—"} • {currentHike.difficulty || "—"}
                  </p>
                </div>
                <Badge variant="secondary">{formatLKR(hikeBaseFee)} base</Badge>
              </div>
            )}
          </div>
        );

      case 2:
        return currentHike?.permitRequired ? (
          <div className="space-y-6">
            <div>
              <Label>Full Name (as on ID)</Label>
              <Input
                value={formData.permitName}
                onChange={(e) => setFormData((p) => ({ ...p, permitName: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-filled from your account — you can edit it if needed.
              </p>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.permitEmail}
                onChange={(e) => setFormData((p) => ({ ...p, permitEmail: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <Check className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2">No permit required for this hike</p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pick gear + quantity (per hike/day).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((item) => {
                const qty = Number(formData.gearQty[item.sku] || 0);
                const selected = qty > 0;

                return (
                  <div
                    key={item._id}
                    className={[
                      "rounded-lg border overflow-hidden bg-background",
                      selected ? "border-primary ring-2 ring-primary/20" : "",
                    ].join(" ")}
                  >
                    <div className="h-44 w-full bg-muted">
                      <img
                        src={item.imageUrl || "/assets/placeholder.png"}
                        alt={item.name}
                        className="h-full w-full object-contain p-3"
                        loading="lazy"
                      />
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatLKR(item.unitPrice)} each
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Checkbox checked={selected} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQty(item.sku, qty - 1)}
                            disabled={qty <= 0}
                          >
                            -
                          </Button>

                          <div className="w-12 text-center font-semibold">{qty}</div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQty(item.sku, qty + 1)}
                          >
                            +
                          </Button>
                        </div>

                        <Badge variant="secondary">{formatLKR(item.unitPrice * qty)}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-accent/20 flex items-center justify-between">
              <p className="text-sm font-medium">Rentals Total</p>
              <p className="text-sm font-semibold">{formatLKR(rentalsFee)}</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Label>Choose a guide</Label>

            <Select value={formData.guide} onValueChange={(value) => setFormData((p) => ({ ...p, guide: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose guide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Guide (Rs. 0)</SelectItem>
                <SelectItem value="basic">Basic Guide (Rs. 3,000)</SelectItem>
                <SelectItem value="expert">Expert Guide (Rs. 6,000)</SelectItem>
              </SelectContent>
            </Select>

            <div className="p-3 rounded-lg bg-accent/20 flex items-center justify-between">
              <p className="text-sm font-medium">Guide Fee</p>
              <p className="text-sm font-semibold">{formatLKR(guideFee)}</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a transport option. We calculate pickup → hike location (round trip).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transportOptions.map((opt) => {
                const active = formData.transport === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={async () => {
                      setStepError("");
                      setDistanceError("");
                      setFormData((p) => ({ ...p, transport: opt.id }));
                      try {
                        await recalcTransportCost(formData.pickupLocation, opt.id);
                      } catch {}
                    }}
                    className={[
                      "text-left rounded-lg border overflow-hidden transition",
                      active ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40",
                    ].join(" ")}
                  >
                    <div className="h-40 w-full bg-muted">
                      <img src={opt.img} alt={opt.title} className="h-full w-full object-contain p-3" loading="lazy" />
                    </div>

                    <div className="p-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{opt.title}</p>
                        <p className="text-sm text-muted-foreground">{opt.subtitle}</p>
                      </div>
                      {active ? <Badge>Selected</Badge> : <Badge variant="secondary">Select</Badge>}
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.transport !== "none" && (
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <PickupAutocomplete
                  value={formData.pickupLocation}
                  onChange={(val) => setFormData((p) => ({ ...p, pickupLocation: val }))}
                  onSelect={async (val) => {
                    setFormData((p) => ({ ...p, pickupLocation: val }));
                    try {
                      await recalcTransportCost(val, formData.transport);
                    } catch {}
                  }}
                />

                {distanceLoading && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculating distance...
                  </p>
                )}

                {distanceError && <p className="text-sm text-red-500">{distanceError}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-accent/20 flex items-center justify-between">
                <p className="text-sm font-medium">Distance (one-way)</p>
                <p className="text-sm font-semibold">
                  {formData.distanceKm ? `${formData.distanceKm.toFixed(1)} km` : "—"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-accent/20 flex items-center justify-between">
                <p className="text-sm font-medium">Transport Cost</p>
                <p className="text-sm font-semibold">{formatLKR(formData.transportCost || 0)}</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <p>
                <b>Hike:</b> {currentHike?.name}
              </p>
              <p>
                <b>Date:</b> {formData.hikeDate} • <b>Time:</b> {formData.hikeTime}
              </p>
              <p>
                <b>Group:</b> {formData.groupSize} • <b>Phone:</b> {formData.contactPhone}
              </p>
              <p>
                <b>Guide:</b> {formData.guide}
              </p>
              <p>
                <b>Transport:</b> {formData.transport}
                {formData.transport !== "none" ? ` • ${formatLKR(formData.transportCost || 0)}` : ""}
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Hike Base Fee</span>
                <b>{formatLKR(hikeBaseFee)}</b>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Guide Fee</span>
                <b>{formatLKR(guideFee)}</b>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Rentals Fee</span>
                <b>{formatLKR(rentalsFee)}</b>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Transport Fee</span>
                <b>{formatLKR(formData.transportCost || 0)}</b>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatLKR(totalCost)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleProceedToPayment} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Processing..." : "Proceed to Payment"}
            </Button>

            {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            </CardHeader>

            <CardContent>
              {renderStepContent()}
              {stepError && <p className="mt-4 text-sm text-red-500">{stepError}</p>}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length && (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
