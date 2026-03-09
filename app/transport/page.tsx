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
import { Users } from "lucide-react";

import carImage from "@/assets/vehicle-car.jpg";
import vanImage from "@/assets/vehicle-van.jpg";
import jeepImage from "@/assets/vehicle-jeep.jpg";

const transportOptions = [
  {
    id: 1,
    name: "Standard Car",
    description: "Comfortable sedan for small groups",
    capacity: "Up to 4 people",
    price: "LKR 80/km",
    image: carImage,
    features: ["Air conditioning", "Experienced driver", "Insurance included", "Luggage space"],
    bestFor: "Small groups and short distances",
  },
  {
    id: 2,
    name: "Van",
    description: "Spacious van for larger groups",
    capacity: "Up to 12 people",
    price: "LKR 100/km",
    image: vanImage,
    features: ["Air conditioning", "Extra luggage space", "Professional driver", "Music system"],
    bestFor: "Group adventures and gear transport",
  },
  {
    id: 3,
    name: "4WD Jeep",
    description: "Rugged vehicle for difficult terrain",
    capacity: "Up to 6 people",
    price: "LKR 120/km",
    image: jeepImage,
    features: ["Off-road capability", "High clearance", "4-wheel drive", "Emergency equipment"],
    bestFor: "Remote trailheads and challenging access",
  },
];

export default function TransportPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-nature py-12 md:py-16 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transport Services</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Reliable and comfortable transportation to take you from your doorstep to the trailhead and back
            safely.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gradient-soft flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-bold mb-2">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  1
                </div>
                <p className="text-sm font-medium">Choose your vehicle</p>
                <p className="text-xs text-muted-foreground mt-1">Select based on group size</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  2
                </div>
                <p className="text-sm font-medium">Provide pickup details</p>
                <p className="text-xs text-muted-foreground mt-1">Enter your location and time</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  3
                </div>
                <p className="text-sm font-medium">Confirm booking</p>
                <p className="text-xs text-muted-foreground mt-1">Get driver details instantly</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {transportOptions.map((option) => (
              <Card key={option.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <Image
                    src={option.image}
                    alt={option.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    priority={option.id === 1}
                  />
                </div>

                <CardHeader>
                  <CardTitle>{option.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{option.description}</p>

                  <div className="space-y-2 pt-2">
                    <Badge variant="secondary" className="text-base font-semibold">
                      {option.price}
                    </Badge>

                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {option.capacity}
                    </p>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Includes:</p>
                    <div className="space-y-1">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-accent/30 rounded-md">
                    <p className="text-xs font-medium text-foreground">Best for:</p>
                    <p className="text-xs text-muted-foreground">{option.bestFor}</p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button variant="adventure" className="w-full" asChild>
                    <Link href="/planner">Book This Vehicle</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Additional Information</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Pricing:</strong> All prices are per kilometer (round trip).
                  Minimum charge applies.
                </p>
                <p>
                  <strong className="text-foreground">Pickup:</strong> We pick up from anywhere in Colombo and
                  major cities. Additional charges may apply for remote locations.
                </p>
                <p>
                  <strong className="text-foreground">Waiting Time:</strong> Driver will wait at the trailhead
                  for your return at no extra cost.
                </p>
                <p>
                  <strong className="text-foreground">Cancellation:</strong> Free cancellation up to 24 hours
                  before pickup time.
                </p>
                <p>
                  <strong className="text-foreground">Safety:</strong> All vehicles are regularly serviced and
                  drivers are experienced with mountain roads.
                </p>
              </div>

              <Button variant="hero" size="lg" className="w-full mt-6">
                Get a Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
