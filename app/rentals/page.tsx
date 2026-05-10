"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { 
  Search, AlertCircle, ShieldCheck, Tag, CreditCard, 
  Clock, Tent, Box, SlidersHorizontal, Check, CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

export default function RentalsPage() {
  const [items, setItems] = useState<RentalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Backend Fetching
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch("/api/rentals", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Failed to load rentals");

        const list: any[] =
          (Array.isArray(data?.rentals) && data.rentals) ||
          (Array.isArray(data?.items) && data.items) ||
          (Array.isArray(data?.rentalItems) && data.rentalItems) ||
          (Array.isArray(data?.data) && data.data) ||
          [];

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
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => {
    const cats = items.map(item => item.category).filter(Boolean) as string[];
    return Array.from(new Set(cats)).sort();
  }, [items]);

  // Frontend Search & Filter
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-muted/30 border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
            <Tent className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Premium Gear <span className="text-primary">Rentals</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Don&apos;t have all the equipment? No problem. Rent high-quality, sanitized hiking gear for your adventure at affordable rates.
          </p>
        </div>
      </section>

      {/* Trust / Perks Banner */}
      <section className="bg-card border-b hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 text-green-600 rounded-lg shrink-0"><ShieldCheck className="h-5 w-5" /></div>
              <p className="font-medium text-foreground">Sanitized & Inspected<span className="block text-xs text-muted-foreground font-normal">Before every single rental</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0"><Tag className="h-5 w-5" /></div>
              <p className="font-medium text-foreground">Multi-Day Discounts<span className="block text-xs text-muted-foreground font-normal">Save 10% on 3+ day trips</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg shrink-0"><CreditCard className="h-5 w-5" /></div>
              <p className="font-medium text-foreground">Refundable Deposit<span className="block text-xs text-muted-foreground font-normal">Secured at checkout</span></p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg shrink-0"><Clock className="h-5 w-5" /></div>
              <p className="font-medium text-foreground">Flexible Returns<span className="block text-xs text-muted-foreground font-normal">Easy drop-off process</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panel (Search & Dropdown Filter) */}
      <section className="bg-card border-b py-4 sticky top-[60px] z-30 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search gear..." 
                className="pl-11 h-11 bg-background rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="w-full sm:w-auto flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-full px-6 flex items-center gap-2 border-dashed w-full sm:w-auto">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {categoryFilter === "all" ? "All Categories" : categoryFilter}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter("all")}
                    className="flex items-center justify-between cursor-pointer rounded-lg my-1"
                  >
                    All Categories
                    {categoryFilter === "all" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuItem 
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className="flex items-center justify-between cursor-pointer rounded-lg my-1"
                    >
                      {cat}
                      {categoryFilter === cat && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="flex-1 py-12 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Error State */}
          {!loading && err && (
            <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-4 mt-2">
                <p>{err}</p>
                <p className="text-xs opacity-80">Please check your database connection to `/api/rentals`.</p>
                <Button variant="outline" size="sm" className="w-fit border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => window.location.reload()}>
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden flex flex-col h-[420px] rounded-2xl border-none shadow-sm">
                  <Skeleton className="h-56 w-full rounded-none" />
                  <div className="p-6 flex flex-col flex-1 gap-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-10 w-24 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Real Data Grid */}
          {!loading && !err && (
            <>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredItems.map((item) => {
                    const stock = item.stock ?? 0;
                    const isOutOfStock = stock === 0;
                    const isLowStock = stock > 0 && stock <= 3; // Highlight if only 1-3 items left

                    return (
                      <Card key={item._id} className="group overflow-hidden flex flex-col border-border/50 bg-card rounded-2xl hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                        
                        {/* Image Area */}
                        <div className="relative h-56 w-full overflow-hidden bg-white p-6 border-b flex items-center justify-center">
                          {isOutOfStock && (
                            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                              <Badge variant="destructive" className="px-3 py-1 text-sm shadow-lg uppercase tracking-wider">Out of Stock</Badge>
                            </div>
                          )}
                          <Image
                            src={item.imageUrl || "/rentals/rental-tent.jpg"}
                            alt={item.name}
                            fill
                            className={cn(
                              "object-contain p-6 transition-transform duration-700 ease-out",
                              !isOutOfStock && "group-hover:scale-110"
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        </div>

                        {/* Content Area */}
                        <div className="flex flex-col flex-1 p-6">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                              {item.name}
                            </CardTitle>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {item.description || "High-quality rental gear for your hike."}
                          </p>

                          {/* Dynamic Stock Indicator */}
                          <div className="flex items-center gap-2 mb-4 text-sm font-medium">
                            <Box className="h-4 w-4 text-muted-foreground" />
                            {isOutOfStock ? (
                              <span className="text-destructive">Unavailable</span>
                            ) : isLowStock ? (
                              <span className="text-amber-500 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                Only {stock} left
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-500 flex items-center gap-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                In Stock
                              </span>
                            )}
                          </div>

                          <Separator className="mb-4" />

                          {/* Footer / Action */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                              <span className="font-bold text-lg text-foreground">
                                {formatLKR(item.unitPrice || 0)}
                              </span>
                              <span className="text-xs text-muted-foreground">per day</span>
                            </div>
                            
                            <Button 
                              className={cn(
                                "rounded-full font-medium transition-all shadow-sm",
                                isOutOfStock && "opacity-50 pointer-events-none"
                              )}
                              onClick={() => window.location.href = "/planner"}
                              disabled={isOutOfStock}
                            >
                              Reserve
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className="bg-background shadow-sm border p-6 rounded-full mb-6">
                    <Tent className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight mb-2">No gear found</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    We couldn't find any equipment matching your criteria.
                  </p>
                  <Button onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }} variant="outline" className="rounded-full px-8">
                    Clear Search
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Bottom CTA Card */}
          {!loading && !err && (
            <div className="mt-16 text-center max-w-3xl mx-auto">
              <Card className="border-primary/20 bg-primary/5 shadow-none rounded-3xl">
                <CardContent className="p-8 md:p-12">
                  <h3 className="text-2xl font-bold mb-3 text-foreground">Need Help Choosing Gear?</h3>
                  <p className="text-muted-foreground mb-8">
                    Not sure what equipment you need? Let our trail experts help you select the right setup based on your chosen hike, the season, and your experience level.
                  </p>
                  <Button size="lg" className="rounded-full px-8" asChild>
                    <Link href="/contact">Contact Our Experts</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}