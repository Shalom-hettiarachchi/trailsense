"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";

import PickupAutocomplete from "@/components/PickupAutocomplete";
import { 
  Check, ChevronRight, ChevronLeft, Loader2, MapPin, 
  Calendar, Clock, Users, ShieldCheck, Tent, UserCheck, 
  Car, Receipt, CheckCircle2, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Constants ---
const steps = [
  { id: 1, name: "Select Hike", icon: MapPin },
  { id: 2, name: "Permit Details", icon: ShieldCheck },
  { id: 3, name: "Rentals & Gear", icon: Tent },
  { id: 4, name: "Guide Selection", icon: UserCheck },
  { id: 5, name: "Transport", icon: Car },
  { id: 6, name: "Review & Confirm", icon: Receipt },
];

const transportOptions = [
  { id: "none", title: "Self Transport", subtitle: "Arrange your own ride", rate: 0, img: "/vehicles/vehicle-self.jpg" },
  { id: "car", title: "Standard Sedan", subtitle: "Rs. 80 per km", rate: 80, img: "/vehicles/vehicle-car.jpg" },
  { id: "van", title: "Expedition Van", subtitle: "Rs. 100 per km", rate: 100, img: "/vehicles/vehicle-van.jpg" },
  { id: "jeep", title: "4WD Mountain Jeep", subtitle: "Rs. 90 per km", rate: 90, img: "/vehicles/vehicle-jeep.jpg" },
] as const;

function formatLKR(n: number) { return `LKR ${Math.round(n).toLocaleString("en-LK")}`; }

type GearQty = Record<string, number>;
type HikeDTO = { _id: string; slug: string; name: string; difficulty?: string; baseFee?: number; permitRequired?: boolean; dropLat?: number; dropLng?: number; isActive?: boolean; };
type RentalDTO = { _id: string; sku: string; name: string; imageUrl?: string; unitPrice: number; isActive?: boolean; };

// ----------------------------------------------------------------------
// Custom Zero-Dependency IOS-Style Wheel Picker
// ----------------------------------------------------------------------
function ScrollWheel({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 40; 
  const containerHeight = 160;
  const padding = (containerHeight - itemHeight) / 2; // 60px

  useEffect(() => {
    if (scrollRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * itemHeight;
      }
    }
  }, []); // Run once on mount to set initial position

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (options[index] && options[index] !== value) {
      onChange(options[index]);
    }
  };

  return (
    <div className="relative h-[160px] w-14 bg-background rounded-md overflow-hidden touch-none select-none">
      {/* Highlight Box */}
      <div className="absolute top-[60px] left-0 right-0 h-[40px] bg-muted/50 rounded-md pointer-events-none z-0" />
      
      {/* Fade Gradients for 3D Cylinder Effect */}
      <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory relative z-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ paddingTop: padding, paddingBottom: padding }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                const index = options.indexOf(opt);
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
                }
              }}
              className={cn(
                "h-[40px] flex items-center justify-center snap-center text-lg font-medium transition-colors duration-200 cursor-pointer",
                value === opt ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Planner Component
// ----------------------------------------------------------------------
function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedHikeSlug = searchParams.get("hike");

  const [currentStep, setCurrentStep] = useState(1);

  const [hikes, setHikes] = useState<HikeDTO[]>([]);
  const [rentals, setRentals] = useState<RentalDTO[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [formData, setFormData] = useState({
    hikeId: preselectedHikeSlug || "",
    hikeDate: undefined as Date | undefined, 
    hikeTime: "08:00 AM",
    contactPhone: "",
    groupSize: "1",
    permitName: "",
    permitEmail: "",
    gearQty: {} as GearQty,
    guide: "none",
    transport: "none",
    pickupLocation: "",
    distanceKm: 0,
    transportCost: 0,
  });

  // Time Picker States
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedAmPm, setSelectedAmPm] = useState("AM");

  // Options arrays for the wheels
  const hoursArray = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutesArray = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  const ampmArray = ["AM", "PM"];

  const [stepError, setStepError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState("");

  useEffect(() => {
    setFormData((p) => ({ ...p, hikeTime: `${selectedHour}:${selectedMinute} ${selectedAmPm}` }));
  }, [selectedHour, selectedMinute, selectedAmPm]);

  // Load hikes + rentals from DB
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
    return () => { alive = false; };
  }, []);

  const currentHike = useMemo(() => {
    return hikes.find((h) => h.slug === formData.hikeId);
  }, [hikes, formData.hikeId]);

  // Autofill permitName/permitEmail
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
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  // Pricing Logic
  const hikeBaseFee = useMemo(() => Number(currentHike?.baseFee || 0), [currentHike]);
  const guideFee = useMemo(() => {
    if (formData.guide === "basic") return 3000;
    if (formData.guide === "expert") return 6000;
    return 0;
  }, [formData.guide]);
  const rentalsFee = useMemo(() => {
    return rentals.reduce((sum, item) => {
      const qty = Number(formData.gearQty[item.sku] || 0);
      return sum + (Number(item.unitPrice || 0) * qty);
    }, 0);
  }, [rentals, formData.gearQty]);
  const totalCost = hikeBaseFee + guideFee + rentalsFee + (formData.transportCost || 0);

  const transportRates: Record<string, number> = { car: 80, jeep: 90, van: 100 };

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

      if (!km || km <= 0) throw new Error("Couldn’t calculate distance. Try a more specific pickup address.");

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

  // --- Navigation Handlers ---
  const validateStep = () => {
    setStepError("");
    if (currentStep === 1) {
      if (!formData.hikeId) return "Please select a hike destination.";
      if (!formData.hikeDate) return "Please select a preferred date.";
      if (!formData.hikeTime) return "Please select a preferred pickup/start time.";
      if (!formData.contactPhone.trim()) return "Please enter your contact number.";
      const size = Number(formData.groupSize);
      if (!size || size < 1 || size > 20) return "Group size must be between 1 and 20.";
    }
    if (currentStep === 2 && currentHike?.permitRequired) {
      if (!formData.permitName.trim()) return "Full name is required for the forestry permit.";
      if (!formData.permitEmail.trim()) return "Email is required for the permit receipt.";
    }
    if (currentStep === 5 && formData.transport !== "none") {
      if (!formData.pickupLocation.trim()) return "Please enter a pickup location.";
      if (distanceError) return distanceError;
    }
    return "";
  };

  const handleNext = () => {
    const msg = validateStep();
    if (msg) return setStepError(msg);
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStepError("");
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    const msg = validateStep();
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
          hikeDate: formData.hikeDate ? format(formData.hikeDate, "yyyy-MM-dd") : "",
          userId,
          priceBreakdown: { hikeBaseFee, guideFee, rentalsFee, transportCost: formData.transportCost, total: totalCost },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Booking failed");

      router.push(`/payment?bookingId=${encodeURIComponent(data.bookingId)}`);
    } catch (e: any) {
      setSubmitError(e?.message || "Something went wrong while securing your booking.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step Rendering ---
  const renderStepContent = () => {
    if (loadingCatalog) {
      return (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Initializing Booking Engine...</p>
        </div>
      );
    }

    if (catalogError) {
      return (
        <div className="py-20 text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-full inline-block mb-4">
            <Info className="h-6 w-6" />
          </div>
          <p className="text-foreground font-semibold">{catalogError}</p>
          <p className="text-sm text-muted-foreground mt-2">Check your API connections and try again.</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> Destination Trail</Label>
              <Select
                value={formData.hikeId}
                onValueChange={(value) => {
                  setStepError("");
                  setFormData((p) => ({ ...p, hikeId: value, distanceKm: 0, transportCost: 0 }));
                }}
              >
                <SelectTrigger className="h-12 text-base bg-muted/50">
                  <SelectValue placeholder="Select a trail to explore" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CALENDAR COMPONENT */}
              <div className="space-y-2 flex flex-col">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-11 w-full justify-start text-left font-normal bg-muted/50",
                        !formData.hikeDate && "text-muted-foreground"
                      )}
                    >
                      {formData.hikeDate ? format(formData.hikeDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.hikeDate}
                      onSelect={(date) => {
                        setStepError("");
                        setFormData((p) => ({ ...p, hikeDate: date }));
                      }}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} 
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* NATIVE SCROLL WHEEL TIME PICKER */}
              <div className="space-y-2 flex flex-col">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> Start Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-11 w-full justify-start text-left font-normal bg-muted/50">
                      {formData.hikeTime}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex gap-2 items-center justify-center rounded-xl">
                      
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-muted-foreground mb-1 font-semibold tracking-wider">Hour</span>
                        <ScrollWheel options={hoursArray} value={selectedHour} onChange={setSelectedHour} />
                      </div>
                      
                      <span className="text-2xl font-bold mt-4 text-muted-foreground/30">:</span>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase text-muted-foreground mb-1 font-semibold tracking-wider">Min</span>
                        <ScrollWheel options={minutesArray} value={selectedMinute} onChange={setSelectedMinute} />
                      </div>

                      <div className="flex flex-col items-center ml-2">
                        <span className="text-[10px] uppercase text-background mb-1">.</span>
                        <ScrollWheel options={ampmArray} value={selectedAmPm} onChange={setSelectedAmPm} />
                      </div>

                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-primary"/> Group Size</Label>
                <Input type="number" min="1" max="20" className="h-11 bg-muted/50" value={formData.groupSize} onChange={(e) => setFormData((p) => ({ ...p, groupSize: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input placeholder="+94 7X XXX XXXX" className="h-11 bg-muted/50" value={formData.contactPhone} onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))} />
              </div>
            </div>
          </div>
        );

      case 2:
        return currentHike?.permitRequired ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Forestry Permit Required</p>
                <p>This trail passes through a protected nature reserve. We will secure the mandatory permit on your behalf.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Hiker Full Name (As per ID/Passport)</Label>
              <Input className="h-11 bg-muted/50" value={formData.permitName} onChange={(e) => setFormData((p) => ({ ...p, permitName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Permit Delivery Email</Label>
              <Input type="email" className="h-11 bg-muted/50" value={formData.permitEmail} onChange={(e) => setFormData((p) => ({ ...p, permitEmail: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 animate-in fade-in duration-500">
            <div className="bg-green-500/10 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Permits Needed</h3>
            <p className="text-muted-foreground">This trail is fully open to the public. You can proceed to the next step.</p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-muted-foreground">Add high-quality gear to your booking. Prices are per day.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rentals.map((item) => {
                const qty = Number(formData.gearQty[item.sku] || 0);
                const selected = qty > 0;

                return (
                  <div key={item._id} className={cn(
                    "rounded-xl border bg-card overflow-hidden transition-all duration-200 flex flex-col",
                    selected ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-primary/50"
                  )}>
                    <div className="h-32 w-full bg-white relative border-b flex items-center justify-center">
                      <img src={item.imageUrl || "/rentals/rental-tent.jpg"} alt={item.name} className="h-full object-contain p-4" loading="lazy" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="font-semibold text-foreground line-clamp-1 mb-1">{item.name}</p>
                      <p className="text-sm text-primary font-medium mb-4">{formatLKR(item.unitPrice)}</p>
                      
                      <div className="mt-auto flex items-center justify-between bg-muted/50 rounded-lg p-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setQty(item.sku, qty - 1)} disabled={qty <= 0}>-</Button>
                        <span className="font-semibold text-sm w-8 text-center">{qty}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setQty(item.sku, qty + 1)}>+</Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-muted-foreground mb-4">Enhance your safety and experience with a local expert.</p>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: "none", title: "Self-Guided", price: "Free", desc: "Navigate the trail yourself. Recommended only for experienced hikers." },
                { id: "basic", title: "Basic Guide", price: "LKR 3,000", desc: "A knowledgeable local to ensure you stay on the trail." },
                { id: "expert", title: "Expert Mountaineer", price: "LKR 6,000", desc: "Certified wilderness first-responder with extensive flora/fauna knowledge." },
              ].map((guide) => (
                <div 
                  key={guide.id}
                  onClick={() => setFormData((p) => ({ ...p, guide: guide.id }))}
                  className={cn(
                    "flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all",
                    formData.guide === guide.id ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" : "hover:border-primary/50 bg-card"
                  )}
                >
                  <div className={cn("mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0", formData.guide === guide.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground")}>
                    {formData.guide === guide.id && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold">{guide.title}</h4>
                      <Badge variant={formData.guide === guide.id ? "default" : "secondary"}>{guide.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-muted-foreground">Select how you want to reach the trailhead.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {transportOptions.map((opt) => {
                const active = formData.transport === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={async () => {
                      setStepError(""); setDistanceError("");
                      setFormData((p) => ({ ...p, transport: opt.id }));
                      if (opt.id !== "none" && formData.pickupLocation) await recalcTransportCost(formData.pickupLocation, opt.id);
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl border overflow-hidden transition-all bg-card flex flex-col",
                      active ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-primary/50"
                    )}
                  >
                    <div className="h-32 w-full bg-white flex items-center justify-center border-b relative">
                      {active && <Badge className="absolute top-2 right-2 shadow-sm bg-primary">Selected</Badge>}
                      <img src={opt.img} alt={opt.title} className="h-full object-contain p-4" loading="lazy" />
                    </div>
                    <div className="p-4 text-center">
                      <p className="font-semibold mb-1">{opt.title}</p>
                      <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {formData.transport !== "none" && (
              <div className="space-y-4 bg-muted/30 p-5 rounded-xl border">
                <div className="space-y-2">
                  <Label>Pickup Location (Hotel/City)</Label>
                  <PickupAutocomplete
                    value={formData.pickupLocation}
                    onChange={(val) => setFormData((p) => ({ ...p, pickupLocation: val }))}
                    onSelect={async (val) => {
                      setFormData((p) => ({ ...p, pickupLocation: val }));
                      try { await recalcTransportCost(val, formData.transport); } catch {}
                    }}
                  />
                  {distanceError && <p className="text-sm text-destructive">{distanceError}</p>}
                </div>

                {distanceLoading ? (
                  <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded-lg w-fit">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating route distance...
                  </div>
                ) : formData.distanceKm > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-3 rounded-lg w-fit">
                    <CheckCircle2 className="h-4 w-4" /> Route found: {formData.distanceKm.toFixed(1)} km (One-way)
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <Receipt className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold text-foreground">Ready to Explore!</h3>
              <p className="text-sm text-muted-foreground mt-2">Please review your trip summary on the right pane before confirming your booking.</p>
            </div>
            
            <div className="space-y-4 border p-5 rounded-xl bg-card">
              <h4 className="font-semibold border-b pb-2">Primary Contact</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-right">{formData.permitName || "N/A"}</span>
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-right">{formData.contactPhone}</span>
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-right break-all">{formData.permitEmail || "N/A"}</span>
              </div>
            </div>

            <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-lg" onClick={handleProceedToPayment} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Securing Booking...</>
              ) : (
                "Confirm & Proceed to Payment"
              )}
            </Button>
            {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      
      {/* Visual Stepper (Desktop) */}
      <div className="hidden md:flex justify-between items-center mb-10 relative px-4">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10 -translate-y-1/2"></div>
        <div className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
        
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 shadow-sm",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                isCurrent ? "bg-background border-primary text-primary" : "bg-background border-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              <span className={cn("text-xs font-semibold whitespace-nowrap", isCurrent ? "text-primary" : "text-muted-foreground")}>{step.name}</span>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          
          {/* Mobile Step Indicator */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Step {currentStep} of {steps.length}</span>
            <span className="text-sm font-medium text-muted-foreground">{steps[currentStep-1].name}</span>
          </div>

          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b pb-6">
              <CardTitle className="flex items-center gap-2 text-2xl">
                {steps[currentStep - 1].name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 min-h-[400px]">
              {renderStepContent()}
              {stepError && (
                <Alert variant="destructive" className="mt-6 animate-in fade-in">
                  <AlertDescription>{stepError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter className="bg-muted/20 border-t p-6 flex justify-between items-center">
              <Button variant="outline" size="lg" onClick={handleBack} disabled={currentStep === 1} className={currentStep === 1 ? "invisible" : ""}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {currentStep < steps.length && (
                <Button size="lg" onClick={handleNext}>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Sticky Summary */}
        <div className="lg:col-span-5 xl:col-span-4 relative">
          <Card className="sticky top-24 border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" /> Trip Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Hike Summary */}
              <div className="p-5 border-b bg-muted/10">
                <h4 className="font-semibold text-foreground mb-1">{currentHike?.name || "No hike selected"}</h4>
                {currentHike && (
                  <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5"/> {formData.hikeDate ? format(formData.hikeDate, "MMM do, yyyy") : "Date TBD"}</span>
                    <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5"/> {formData.hikeTime || "Time TBD"}</span>
                    <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5"/> {formData.groupSize} Hikers</span>
                  </div>
                )}
              </div>

              {/* Live Cost Breakdown */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base Fee</span>
                  <span className="font-medium">{formatLKR(hikeBaseFee)}</span>
                </div>
                {guideFee > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Guide ({formData.guide})</span>
                    <span className="font-medium">{formatLKR(guideFee)}</span>
                  </div>
                )}
                {rentalsFee > 0 && (
                  <div className="flex justify-between items-center text-sm text-primary">
                    <span className="font-medium">Gear Rentals</span>
                    <span className="font-medium">{formatLKR(rentalsFee)}</span>
                  </div>
                )}
                {formData.transportCost > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Transport ({formData.transport})</span>
                    <span className="font-medium">{formatLKR(formData.transportCost)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-muted p-5 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Due</span>
                <span className="text-xl font-bold text-primary">{formatLKR(totalCost)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/5">
      <Navigation />

      {/* Simplified App Header */}
      <div className="bg-primary/90 text-primary-foreground pt-24 pb-12 border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Build Your Expedition</h1>
          <p className="opacity-90 max-w-xl mx-auto text-sm md:text-base">Customize your journey step-by-step. All costs are updated in real-time.</p>
        </div>
      </div>

      <main className="flex-1 py-10 -mt-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="font-medium">Loading Booking Engine...</p>
          </div>
        }>
          <PlannerContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}