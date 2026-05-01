"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Clock, TrendingUp, Calendar, FileCheck, AlertTriangle, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HikeDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hike, setHike] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  useEffect(() => {
    async function fetchHike() {
      if (!id) return;
      try {
        setLoading(true);
        
        // 1. Try fetching by slug (e.g., Narangala)
        const res = await fetch(`/api/hikes/byslug/${id}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.hike) {
            setHike(data.hike);
            return;
          }
        }

        // 2. Fallback: Try fetching by MongoDB ID if slug lookup fails
        const idRes = await fetch(`/api/hikes/${id}`);
        if (idRes.ok) {
          const idData = await idRes.json();
          if (idData.hike) setHike(idData.hike);
        }
      } catch (err) {
        console.error("Failed to load hike:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHike();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!hike) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Hike Not Found</h1>
            <p className="mb-6 text-muted-foreground">We couldn't find the trail "{id}"</p>
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
    Easy: "bg-emerald-500/20 text-emerald-600",
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
      router.push(`/planner?hike=${hike._id}`);
    } catch {
      setLoginDialogOpen(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>You must be logged in to plan and book a hike.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
            <Button asChild><Link href="/auth">Go to Login</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section
        className="relative h-[450px] bg-cover bg-center"
        style={{ backgroundImage: `url(${hike.imageUrl || hike.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="relative z-10 container mx-auto h-full flex flex-col justify-end pb-8 px-4 text-white">
          <Badge className={`${difficultyColors[hike.difficulty]} w-fit mb-4 border-none`}>
            {hike.difficulty}
          </Badge>
          <h1 className="text-5xl font-bold mb-2">{hike.name}</h1>
          <p className="flex items-center gap-2 text-lg text-white/90">
            <MapPin className="h-5 w-5" />
            {hike.location}
          </p>
        </div>
      </section>

      <section className="border-y py-6 bg-card">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div><Clock className="mx-auto mb-1 text-primary" /><p className="font-semibold">{hike.duration}</p></div>
          <div><TrendingUp className="mx-auto mb-1 text-primary" /><p className="font-semibold">{hike.distance}</p></div>
          <div><Calendar className="mx-auto mb-1 text-primary" /><p className="font-semibold">{hike.bestSeason}</p></div>
          <div><FileCheck className="mx-auto mb-1 text-primary" /><p className="font-semibold">{hike.permitRequired ? "Required" : "Not Needed"}</p></div>
        </div>
      </section>

      <section className="flex-1 py-12">
        <div className="container mx-auto grid lg:grid-cols-3 gap-8 px-4">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Trail Description</h2>
                <p className="text-muted-foreground leading-relaxed">{hike.fullDescription || hike.description}</p>
            </CardContent></Card>

            {hike.highlights?.length > 0 && (
              <Card><CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold mb-4"><Sparkles className="h-5 w-5 text-yellow-500" />Highlights</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {hike.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-primary mt-1">•</span> {h}</li>
                  ))}
                </ul>
              </CardContent></Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <Button size="lg" className="w-full text-lg h-12" onClick={handlePlanClick} disabled={checkingAuth}>
                  {checkingAuth ? "Verifying..." : "Start Planning"}
                </Button>

                {hike.mapEmbedUrl && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                       <MapPin className="h-4 w-4" /> Trail Location
                    </h3>
                    <div className="overflow-hidden rounded-xl border aspect-video">
                      <iframe src={hike.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen />
                    </div>
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