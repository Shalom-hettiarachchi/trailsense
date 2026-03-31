"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, SlidersHorizontal, Map, MountainSnow, AlertCircle, 
  RefreshCcw, LayoutGrid, List, MapPin, Clock, TrendingUp, ArrowRight 
} from "lucide-react";

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
  imageUrl?: string;
  isActive?: boolean;
};

export default function Hikes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [hikes, setHikes] = useState<HikeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Backend Fetching (Untouched)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/hikes?activeOnly=1", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load hikes.");

        const list = Array.isArray(data?.hikes) ? data.hikes : [];

        if (!alive) return;
        setHikes(list);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "An unexpected error occurred.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const filteredHikes = useMemo(() => {
    return hikes.filter((hike) => {
      const matchesSearch = 
        searchQuery === "" || 
        hike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hike.location.toLowerCase().includes(searchQuery.toLowerCase());

      const difficultyMatch =
        difficultyFilter === "all" || hike.difficulty === difficultyFilter;

      const seasonMatch =
        seasonFilter === "all" ||
        String(hike.bestSeason || "")
          .toLowerCase()
          .includes(seasonFilter.toLowerCase());

      return matchesSearch && difficultyMatch && seasonMatch;
    });
  }, [hikes, searchQuery, difficultyFilter, seasonFilter]);

  const activeFiltersCount = (difficultyFilter !== "all" ? 1 : 0) + (seasonFilter !== "all" ? 1 : 0) + (searchQuery !== "" ? 1 : 0);

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("all");
    setSeasonFilter("all");
  };

  const getDifficultyColor = (level: string) => {
    switch(level) {
      case "Easy": return "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20";
      case "Moderate": return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20";
      case "Hard": return "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20";
      case "Expert": return "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-muted/30 border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Discover Your Next <span className="text-primary">Adventure</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore Sri Lanka’s most breathtaking trails.
          </p>
        </div>
      </section>

      {/* Control Panel */}
      <section className="bg-card border-b sticky top-[60px] z-30 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search trails or locations..." 
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex w-full lg:w-auto gap-3 items-center justify-between lg:justify-end overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2">
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Season</SelectItem>
                    <SelectItem value="december">December</SelectItem>
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="year-round">Year-round</SelectItem>
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0 text-muted-foreground">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex bg-muted/50 p-1 rounded-lg border ml-2">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 px-2.5">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 px-2.5">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hike Presentation Area */}
      <section className="flex-1 py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Error State */}
          {!loading && err && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{err}</AlertDescription>
            </Alert>
          )}

          {/* Dynamic Layout Wrapper */}
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "flex flex-col gap-6 max-w-4xl mx-auto"
          }>
            
            {/* Loading Skeletons */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className={viewMode === "grid" ? "flex flex-col h-[420px]" : "flex flex-col sm:flex-row h-auto sm:h-[220px]"}>
                <Skeleton className={viewMode === "grid" ? "h-[200px] w-full rounded-b-none" : "h-[200px] sm:h-full sm:w-[280px] rounded-b-none sm:rounded-r-none"} />
                <div className="p-6 flex-1 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            ))}

            {/* Render Hikes */}
            {!loading && !err && filteredHikes.map((hike) => (
              <Card 
                key={hike._id} 
                className={`group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 ${viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"}`}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden bg-muted ${viewMode === "list" ? "h-64 sm:h-auto sm:w-[320px] shrink-0" : "h-[220px] w-full"}`}>
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Badge variant="outline" className={`backdrop-blur-md bg-background/80 ${getDifficultyColor(hike.difficulty)}`}>
                      {hike.difficulty}
                    </Badge>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={hike.imageUrl || "/api/placeholder/600/400"} 
                    alt={hike.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                </div>

                {/* Content Container */}
                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{hike.location}</span>
                  </div>
                  
                  <CardTitle className="text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {hike.name}
                  </CardTitle>
                  
                  <p className={`text-muted-foreground text-sm mb-6 ${viewMode === "grid" ? "line-clamp-2" : "line-clamp-3"}`}>
                    {hike.description}
                  </p>

                  {/* Push stats to bottom */}
                  <div className="mt-auto">
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {hike.distance}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {hike.duration}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-full h-8 w-14" asChild>
                        <Link href={`/hikes/${hike.slug}`}>
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!loading && !err && filteredHikes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted p-6 rounded-full mb-6">
                <MountainSnow className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No trails found</h3>
              <p className="text-muted-foreground max-w-md mb-6">Try adjusting your search or filter parameters.</p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}