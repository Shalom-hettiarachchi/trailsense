"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { hikes } from "@/data/hikes";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  FileCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function HikeDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const hike = hikes.find((h) => h.id === id);

  if (!hike) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Hike Not Found</h1>
            <Button asChild>
              <Link href="/hikes">Back to Hikes</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    Easy: "bg-accent text-accent-foreground",
    Moderate: "bg-primary/20 text-primary",
    Hard: "bg-destructive/20 text-destructive",
    Expert: "bg-destructive text-destructive-foreground",
  };

  const handlePlanClick = async () => {
    if (checkingAuth) return;

    try {
      setCheckingAuth(true);

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Not logged in");

      router.push(`/planner?hike=${hike.id}`);
    } catch {
      setLoginDialogOpen(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  // If you added this to hikes data, it should be ONLY the src URL:
  // hike.mapEmbedUrl = "https://www.google.com/maps/embed?pb=...."
  const mapSrc = (hike as any)?.mapEmbedUrl as string | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Login Required Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to plan and book a hike.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button asChild>
              <Link href="/auth">Go to Login</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <section
        className="relative h-[450px] bg-cover bg-center"
        style={{ backgroundImage: `url(${hike.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />

        <div className="relative z-10 container mx-auto h-full flex flex-col justify-end pb-8">
          <Badge className={`${difficultyColors[hike.difficulty]} w-fit mb-4`}>
            {hike.difficulty}
          </Badge>

          <h1 className="text-5xl font-bold mb-2">{hike.name}</h1>

          <p className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {hike.location}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y py-6">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Clock className="mx-auto mb-1" />
            <p className="font-semibold">{hike.duration}</p>
          </div>

          <div>
            <TrendingUp className="mx-auto mb-1" />
            <p className="font-semibold">{hike.distance}</p>
          </div>

          <div>
            <Calendar className="mx-auto mb-1" />
            <p className="font-semibold">{hike.bestSeason}</p>
          </div>

          <div>
            <FileCheck className="mx-auto mb-1" />
            <p className="font-semibold">
              {hike.permitRequired ? "Permit Required" : "No Permit Needed"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-16">
        <div className="container mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-2">Trail Description</h2>
                <p className="text-muted-foreground">{hike.fullDescription}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold mb-3">
                  <Sparkles className="h-5 w-5" />
                  Highlights
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  {hike.highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold mb-3">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Safety Tips
                </h2>
                <ul className="list-disc pl-5 space-y-1">
                  {hike.safetyTips.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right column (buttons + map) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePlanClick}
                  disabled={checkingAuth}
                >
                  {checkingAuth ? "Checking..." : "Start Planning This Hike"}
                </Button>

                <Button variant="adventure" size="lg" className="w-full" asChild>
                  <Link href="/fitness-check">Check My Fitness Level</Link>
                </Button>

                {/* ✅ Map directly under Fitness button */}
                {mapSrc && (
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold mb-2">Trail Location</h3>

                    <div className="overflow-hidden rounded-lg border">
                      <iframe
                        src={mapSrc}
                        width="100%"
                        height="260"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Tip: click “View larger map” inside the map to open Google Maps.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
