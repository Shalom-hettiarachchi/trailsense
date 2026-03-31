"use client";

import Image from "next/image";
import Link from "next/link";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Car, MapPin, CalendarCheck, CheckCircle2, 
  Wind, Briefcase, ShieldCheck, Music, MountainSnow, Map, Clock, ShieldAlert 
} from "lucide-react";

import carImage from "@/assets/vehicle-car.jpg";
import vanImage from "@/assets/vehicle-van.jpg";
import jeepImage from "@/assets/vehicle-jeep.jpg";

// Helper to map string features to icons for a better UI
const getFeatureIcon = (feature: string) => {
  const f = feature.toLowerCase();
  if (f.includes("air") || f.includes("ac")) return <Wind className="h-4 w-4" />;
  if (f.includes("luggage") || f.includes("gear")) return <Briefcase className="h-4 w-4" />;
  if (f.includes("insurance") || f.includes("safe")) return <ShieldCheck className="h-4 w-4" />;
  if (f.includes("music")) return <Music className="h-4 w-4" />;
  if (f.includes("off-road") || f.includes("clearance") || f.includes("4-wheel")) return <MountainSnow className="h-4 w-4" />;
  return <CheckCircle2 className="h-4 w-4" />; // default fallback
};

const transportOptions = [
  {
    id: 1,
    name: "Standard Sedan",
    description: "Comfortable and efficient transport for solo hikers or small couples.",
    capacity: "Up to 4 Passengers",
    price: "LKR 80",
    priceUnit: "per km",
    image: carImage,
    features: ["Air conditioning", "Luggage space", "Insurance included", "Experienced driver"],
    bestFor: "Short distances & paved trailheads",
  },
  {
    id: 2,
    name: "Expedition Van",
    description: "Spacious interior perfect for larger groups carrying heavy camping gear.",
    capacity: "Up to 12 Passengers",
    price: "LKR 100",
    priceUnit: "per km",
    image: vanImage,
    features: ["Air conditioning", "Extra luggage space", "Music system", "Professional driver"],
    bestFor: "Group adventures & overnight trips",
  },
  {
    id: 3,
    name: "4WD Mountain Jeep",
    description: "Rugged off-road capability designed to tackle the most difficult terrain safely.",
    capacity: "Up to 6 Passengers",
    price: "LKR 120",
    priceUnit: "per km",
    image: jeepImage,
    features: ["Off-road capability", "High clearance", "4-wheel drive", "Emergency equipment"],
    bestFor: "Remote trails & challenging access",
  },
];

export default function TransportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-muted/30 border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
            <Car className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Trailhead <span className="text-primary">Transfers</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Reliable, safe, and comfortable transportation to take you from your doorstep directly to the mountain and back.
          </p>
        </div>
      </section>

      {/* How it Works - Timeline Design */}
      <section className="bg-card border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-10 text-center tracking-tight">How Transfers Work</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting Line for Desktop */}
              <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-muted-foreground/20 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-12 h-12 bg-background border-2 border-primary/20 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Car className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Select Vehicle</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Choose the perfect ride based on your group size, gear, and destination terrain.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-12 h-12 bg-background border-2 border-primary/20 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">2. Set Coordinates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Input your pickup location in the planner. We cover all major cities and hotels.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-12 h-12 bg-background border-2 border-primary/20 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Instant Booking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Confirm your trip and receive driver details immediately via the dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="flex-1 py-16 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {transportOptions.map((option) => (
              <Card key={option.id} className="flex flex-col overflow-hidden bg-card border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-2xl group">
                
                {/* Image Container */}
                <div className="relative h-56 w-full bg-white border-b flex items-center justify-center overflow-hidden">
                  <Badge variant="secondary" className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md shadow-sm">
                    {option.capacity}
                  </Badge>
                  <Image
                    src={option.image}
                    alt={option.name}
                    fill
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={option.id === 1}
                  />
                </div>

                {/* Content */}
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <CardTitle className="text-2xl">{option.name}</CardTitle>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-lg text-primary">{option.price}</div>
                      <div className="text-xs text-muted-foreground font-medium">{option.priceUnit}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col pt-0">
                  <Separator className="my-4" />
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6 flex-1">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary/70 shrink-0">{getFeatureIcon(feature)}</span>
                        <span className="line-clamp-1" title={feature}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Best For Tag */}
                  <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3 border border-border/50">
                    <Map className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-0.5">Ideal Route</p>
                      <p className="text-sm text-muted-foreground">{option.bestFor}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 px-6">
                  <Button className="w-full rounded-full h-12 text-base shadow-sm" asChild>
                    <Link href="/planner">Select Vehicle</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="max-w-5xl mx-auto overflow-hidden rounded-3xl border-border/50 shadow-sm">
            <div className="bg-primary/5 border-b px-8 py-6">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Transfer Policies & Info</h3>
              <p className="text-muted-foreground mt-1">Everything you need to know before you book.</p>
            </div>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-t-0">
                
                <div className="p-8">
                  <div className="bg-background border w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Pickup Range</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We dispatch from Colombo and major municipal centers. Additional staging fees may apply for deep remote pickups.
                  </p>
                </div>

                <div className="p-8">
                  <div className="bg-background border w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Driver Wait Time</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For round trips, your driver will wait at the basecamp or designated trailhead pickup zone at no additional hourly cost.
                  </p>
                </div>

                <div className="p-8">
                  <div className="bg-background border w-10 h-10 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Cancellations</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Plans change. Cancel up to 24 hours before your scheduled dispatch time for a full refund, no questions asked.
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      <Footer />
    </div>
  );
}