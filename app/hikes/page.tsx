"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HikeCard from "@/components/HikeCard";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type HikeDTO = {
  _id: string;
  slug: string;
  name: string;
  location: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert";
  duration: string;
  distance: string;
  bestSeason: string;
  description: string;
  fullDescription?: string;
  imageUrl?: string;
  permitRequired: boolean;
  safetyTips?: string[];
  highlights?: string[];
  mapEmbedUrl?: string;

  baseFee: number;
  dropLat: number;
  dropLng: number;

  isActive?: boolean;
};

export default function Hikes() {
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");

  const [hikes, setHikes] = useState<HikeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ Load hikes from Mongo
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/hikes?activeOnly=1", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load hikes");

        const list = Array.isArray(data?.hikes) ? data.hikes : [];

        if (!alive) return;
        setHikes(list);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load hikes");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filteredHikes = useMemo(() => {
    return hikes.filter((hike) => {
      const difficultyMatch =
        difficultyFilter === "all" || hike.difficulty === difficultyFilter;

      const seasonMatch =
        seasonFilter === "all" ||
        String(hike.bestSeason || "")
          .toLowerCase()
          .includes(seasonFilter.toLowerCase());

      return difficultyMatch && seasonMatch;
    });
  }, [hikes, difficultyFilter, seasonFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-nature py-16 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Adventure
          </h1>
          <p className="max-w-3xl mx-auto text-lg opacity-90">
            Browse Sri Lanka’s finest hiking trails and filter by difficulty and season.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container mx-auto flex flex-wrap gap-4 justify-between">
          <div className="flex gap-4">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="december">Dec</SelectItem>
                <SelectItem value="january">Jan</SelectItem>
                <SelectItem value="year-round">Year-round</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setDifficultyFilter("all");
              setSeasonFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </section>

      {/* Grid */}
      <section className="flex-1 py-16">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-muted-foreground py-10">
              <Loader2 className="mx-auto h-5 w-5 animate-spin mb-2" />
              Loading hikes...
            </div>
          )}

          {!loading && err && (
            <p className="col-span-full text-center text-red-500">{err}</p>
          )}

          {!loading && !err && filteredHikes.length ? (
            filteredHikes.map((hike) => (
              <HikeCard
                key={hike._id}
                {...({
                  // ✅ map Mongo fields to what your HikeCard expects
                  id: hike.slug, // planner expects slug
                  name: hike.name,
                  location: hike.location,
                  difficulty: hike.difficulty,
                  duration: hike.duration,
                  distance: hike.distance,
                  bestSeason: hike.bestSeason,
                  description: hike.description,
                  fullDescription: hike.fullDescription,
                  image: hike.imageUrl || "/hikes/placeholder.jpg",
                  permitRequired: hike.permitRequired,
                  safetyTips: hike.safetyTips || [],
                  highlights: hike.highlights || [],
                  mapEmbedUrl: hike.mapEmbedUrl || "",
                  baseFee: hike.baseFee || 0,
                  dropLat: hike.dropLat || 0,
                  dropLng: hike.dropLng || 0,
                } as any)}
              />
            ))
          ) : (
            !loading &&
            !err && (
              <p className="col-span-full text-center text-muted-foreground">
                No hikes match your filters.
              </p>
            )
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
