"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useAnimation, useMotionValue, useTransform } from "framer-motion";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Lock, ShieldCheck, Calendar, 
  MapPin, Loader2, AlertCircle, ArrowRight, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatLKR(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

// ----------------------------------------------------------------------
// Slide to Pay Component
// ----------------------------------------------------------------------
interface SlideToPayProps {
  onSuccess: () => void;
  isLoading: boolean;
  amount: string;
}

function SlideToPay({ onSuccess, isLoading, amount }: SlideToPayProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [maxDrag, setMaxDrag] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Calculate the max drag distance based on container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Container width - handle width (64px) - padding (12px)
        setMaxDrag(containerRef.current.offsetWidth - 64 - 12);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Fade out the text as the user drags
  const textOpacity = useTransform(x, [0, maxDrag * 0.5], [1, 0]);

  const playSound = () => {
    try {
      // Clean, professional success sound from Google's public UI library
      const audio = new Audio("https://actions.google.com/sounds/v1/ui/software_interface_start.ogg");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleDragEnd = async (event: any, info: any) => {
    const velocity = info.velocity.x;
    const currentX = x.get();

    // If dragged past 75% or swiped fast
    if (currentX > maxDrag * 0.75 || velocity > 500) {
      setIsUnlocked(true);
      playSound();
      await controls.start({ x: maxDrag, transition: { type: "spring", stiffness: 400, damping: 30 } });
      onSuccess();
    } else {
      // Snap back to start if not dragged far enough
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-[68px] w-full rounded-full bg-muted/40 border border-border overflow-hidden flex items-center p-1.5 transition-colors duration-500",
        isUnlocked ? "bg-primary/5 border-primary/30" : ""
      )}
    >
      {/* Background Text & Shimmer */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className={cn(
          "font-medium tracking-wide flex items-center gap-2 text-muted-foreground",
          !isLoading && !isUnlocked && "animate-pulse" // Simple shimmer alternative
        )}>
          {isLoading ? "Processing Gateway..." : `Slide to pay ${amount}`}
        </span>
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
        drag={isUnlocked || isLoading ? false : "x"}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={cn(
          "h-14 w-16 rounded-full flex items-center justify-center z-10 shadow-md transition-colors duration-300",
          isUnlocked ? "bg-primary text-primary-foreground" : "bg-foreground text-background cursor-grab active:cursor-grabbing",
          isLoading && "opacity-80 cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isUnlocked ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <ArrowRight className="h-6 w-6" />
        )}
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Payment Page Logic
// ----------------------------------------------------------------------
function PaymentContent() {
  const sp = useSearchParams();
  const bookingId = sp.get("bookingId");

  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [total, setTotal] = useState(0);
  const [hikeName, setHikeName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!bookingId) {
          setErr("No booking ID provided. Please return to the planner to start over.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/bookings?bookingId=${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load booking details");

        const b = data?.booking;
        if (!b) throw new Error("Booking not found in the system");

        if (!alive) return;
        setTotal(Number(b.totalCost || 0));
        setHikeName(b.hikeName || "Custom Expedition");
        setDateTime(`${b.hikeDate || "TBD"} • ${b.hikeTime || "TBD"}`);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "An unexpected error occurred.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [bookingId]);

  async function handleUnlock() {
    setErr("");
    setIsRedirecting(true);
    
    try {
      if (!bookingId) throw new Error("Missing bookingId");

      const res = await fetch("/api/payhere/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to initialize payment gateway");

      const { actionUrl, payload } = data;

      // Build hidden form for PayHere
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
      setErr(e?.message || "Failed to redirect to checkout.");
      setIsRedirecting(false);
    }
  }

  if (err && !loading) {
    return (
      <Alert variant="destructive" className="animate-in fade-in zoom-in-95 duration-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-4">
          <p>{err}</p>
          <Button variant="outline" className="w-fit border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => window.location.href = '/planner'}>
            Return to Planner
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner */}
      <div className="bg-primary/5 border-b p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        <div className="mx-auto w-14 h-14 bg-background border shadow-sm text-primary rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Secure Checkout</h2>
        <p className="text-sm text-muted-foreground">Complete your payment to confirm your booking.</p>
      </div>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2 w-full">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0" />
            </div>
            <Separator />
            <div className="flex justify-between items-center py-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[68px] w-full rounded-full" />
          </div>
        ) : (
          <div className="flex flex-col">
            
            {/* Order Details */}
            <div className="p-6 md:p-8 bg-muted/5">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    {hikeName}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {dateTime}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Total & Action */}
            <div className="p-6 md:p-8 bg-card">
              <div className="flex justify-between items-end mb-8">
                <span className="text-muted-foreground font-medium text-lg">Total Due</span>
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {formatLKR(total)}
                </span>
              </div>

              {/* The new Slide to Pay Interactive Component */}
              <SlideToPay 
                onSuccess={handleUnlock} 
                amount={formatLKR(total)} 
                isLoading={isRedirecting} 
              />
            </div>

            {/* Trust Footer */}
            <div className="bg-muted/30 border-t p-4 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
                Payments securely processed via <span className="font-medium text-foreground">PayHere Sandbox</span>.
              </p>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/10 selection:bg-primary/20">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-12 md:py-24 px-4">
        <div className="w-full max-w-lg">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p className="font-medium">Initializing Secure Gateway...</p>
            </div>
          }>
            <PaymentContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}