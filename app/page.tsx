import Link from "next/link";
import Image from "next/image"; 

import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HikeCard from "@/components/HikeCard";

import { hikes } from "@/data/hikes";
import { Target, Map, Shield } from "lucide-react";

import heroImage from "@/assets/hero-mountains.png";



export default function Home() {
  const featuredHikes = hikes;

  return (
    
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage.src})` }}

        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/70" />

        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Plan Your Hike Here
          </h1>
          <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Explore our collection of Sri Lanka&apos;s most stunning hiking trails — from mist-covered peaks to
            hidden jungle paths. Each trail offers a unique story and breathtaking views. Choose your hike and
            plan every step easily, from permits to transport.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button variant="hero" size="xl" asChild>
              <Link href="/hikes">Explore Hikes</Link>
            </Button>
            <Button variant="adventure" size="xl" asChild>
              <Link href="/planner">Plan My Hike</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Choose Your Adventure Section */}
      <section className="py-16 md:py-24 bg-gradient-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose Your Adventure
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover trails that match your experience and challenge yourself with Sri Lanka&apos;s most
              spectacular mountain landscapes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredHikes.map((hike) => (
              <HikeCard
                key={hike.id}
                id={hike.id}
                name={hike.name}
                image={hike.image}
                location={hike.location}
                difficulty={hike.difficulty}
                duration={hike.duration}
                description={hike.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Choose TrailSense
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We make hiking in Sri Lanka easier, safer, and more memorable with comprehensive planning tools
              and local expertise.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Smart & Personalized Planning</h3>
              <p className="text-muted-foreground">
                Our AI-powered fitness check helps you choose the perfect trail based on your experience and
                abilities. Get personalized recommendations tailored to your skill level.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Map className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Everything in One Place</h3>
              <p className="text-muted-foreground">
                From permits and gear rentals to transport and guides — plan your entire hiking adventure
                through our comprehensive platform. No need to juggle multiple services.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Trusted Local Expertise</h3>
              <p className="text-muted-foreground">
                Our experienced local guides know every trail intimately. Benefit from insider knowledge, safety
                protocols, and authentic cultural experiences on your hiking journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
