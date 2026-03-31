"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Bot, Activity, Mountain, ShieldCheck, Sparkles, Map } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function FitnessCheckPage() {
  const [formData, setFormData] = useState({
    age: "",
    fitnessLevel: "moderate",
    experience: "",
    medicalConcerns: "",
    activityLevel: "",
    hike: "",
  });

  const [aiResult, setAiResult] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAI(true);
    setAiResult("");
    try {
      const res = await fetch("/api/fitness-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, hikeName: formData.hike }),
      });
      const data = await res.json();
      setAiResult(data.result);
    } catch {
      setAiResult("AI analysis failed. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Modern Hero Section */}
      <section className="relative py-16 md:py-19 border-b bg-muted/30 overflow-hidden mt-12">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by TrailSense AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
            Hike Readiness <span className="text-primary">Checker</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do not leave your safety to guesswork. Input your vitals and let our AI cross-reference your fitness profile against topographical trail data.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: The Form (Spans 7 columns) */}
            <div className="lg:col-span-7">
              <Card className="border-muted/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Activity className="h-6 w-6 text-primary" />
                    Your Fitness Profile
                  </CardTitle>
                  <CardDescription>
                    Fill out the details below as accurately as possible for the best AI guidance.
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Grid for Hike & Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Target Trail</Label>
                        <Select value={formData.hike} onValueChange={(v) => setFormData({ ...formData, hike: v })} required>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Select your destination" /></SelectTrigger>
                          <SelectContent>
                            {["Yahangala Mountain", "Knuckles 5 Peaks", "Kabaragala", "Garandiella Mountain", "Kehelpathdoruwa Mountain"].map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Age</Label>
                        <Input 
                          type="number" 
                          required 
                          className="h-12"
                          placeholder="e.g. 25"
                          value={formData.age} 
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })} 
                        />
                      </div>
                    </div>

                    {/* Custom Styled Radio Group for Fitness Level */}
                    <div className="space-y-3">
                      <Label>Current Fitness Level</Label>
                      <RadioGroup 
                        value={formData.fitnessLevel} 
                        onValueChange={(v) => setFormData({ ...formData, fitnessLevel: v })} 
                        required
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                      >
                        {[
                          { id: "beginner", label: "Beginner", desc: "Rarely exercise" },
                          { id: "moderate", label: "Moderate", desc: "Active 2-3x a week" },
                          { id: "advanced", label: "Advanced", desc: "Highly active" }
                        ].map((level) => (
                          <div key={level.id}>
                            <RadioGroupItem value={level.id} id={level.id} className="peer sr-only" />
                            <Label
                              htmlFor={level.id}
                              className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                              <span className="font-semibold text-foreground capitalize mb-1">{level.label}</span>
                              <span className="text-xs text-muted-foreground text-center">{level.desc}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Grid for Experience & Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Past Hiking Experience</Label>
                        <Select value={formData.experience} onValueChange={(v) => setFormData({ ...formData, experience: v })} required>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Select experience" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No experience</SelectItem>
                            <SelectItem value="few">A few short hikes</SelectItem>
                            <SelectItem value="several">Several day hikes</SelectItem>
                            <SelectItem value="experienced">Experienced mountaineer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Daily Activity Level</Label>
                        <Select value={formData.activityLevel} onValueChange={(v) => setFormData({ ...formData, activityLevel: v })} required>
                          <SelectTrigger className="h-12"><SelectValue placeholder="Select routine" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Mostly desk-bound</SelectItem>
                            <SelectItem value="moderate">Light walking/movement</SelectItem>
                            <SelectItem value="active">Physically demanding job</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Medical Concerns <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                      <Textarea 
                        className="resize-none min-h-[100px]"
                        placeholder="e.g., Asthma, previous knee injuries, altitude sensitivity..." 
                        value={formData.medicalConcerns} 
                        onChange={(e) => setFormData({ ...formData, medicalConcerns: e.target.value })} 
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">
                        <strong>Disclaimer:</strong> This assessment provides AI-generated guidance based on general metrics. Always consult a healthcare professional before attempting strenuous physical activity.
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={loadingAI}>
                      {loadingAI ? (
                        <>
                          <Bot className="mr-2 h-5 w-5 animate-bounce" /> 
                          Running Analysis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Readiness Report
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Dynamic Output (Spans 5 columns) */}
            <div className="lg:col-span-5 relative h-full">
              <div className="sticky top-8 h-[calc(100vh-10rem)] min-h-[500px] flex flex-col">
                
                {/* 1. Loading State */}
                {loadingAI && (
                  <Card className="border-primary/20 shadow-md h-full flex flex-col">
                    <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Crunching Trail Data...</CardTitle>
                          <CardDescription>Cross-referencing your profile with topography</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8 flex-1">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Analyzing cardiovascular readiness</span>
                          <span className="animate-pulse">Done</span>
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Evaluating terrain difficulty</span>
                          <span className="animate-pulse">Done</span>
                        </div>
                        <Skeleton className="h-2 w-[85%]" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-primary font-medium">
                          <span>Compiling final recommendation...</span>
                          <span className="animate-bounce">...</span>
                        </div>
                        <Skeleton className="h-2 w-[40%]" />
                      </div>
                      
                      {/* Faux skeleton text layout */}
                      <div className="pt-6 space-y-2 opacity-50">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 2. Result State (The Dashboard) */}
                {!loadingAI && aiResult && (
                  <Card className="border-primary/30 shadow-xl bg-card flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-4 shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="default" className="bg-primary hover:bg-primary">
                          Analysis Complete
                        </Badge>
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-2xl text-foreground">Readiness Report</CardTitle>
                      <CardDescription className="text-sm">
                        Target: <span className="font-semibold text-foreground">{formData.hike || "Selected Trail"}</span>
                      </CardDescription>
                    </CardHeader>
                    
                    {/* ScrollArea keeps the card size manageable */}
                    <ScrollArea className="flex-1 p-6">
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                        prose-headings:text-foreground prose-headings:font-semibold 
                        prose-p:leading-relaxed prose-p:text-muted-foreground
                        prose-a:text-primary hover:prose-a:text-primary/80
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-ul:list-disc prose-ul:pl-4
                        prose-li:marker:text-primary">
                        <ReactMarkdown>{aiResult}</ReactMarkdown>
                      </div>
                    </ScrollArea>

                    {/* Fixed Action Footer */}
                    <CardFooter className="bg-muted/30 border-t p-4 shrink-0 flex justify-between items-center flex-wrap gap-2">
                      <p className="text-xs text-muted-foreground w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
                        Generated by TrailSense AI Engine
                      </p>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => window.print()}>
                          Save PDF
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none">
                          Browse Gear Rentals
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )}

                {/* 3. Empty / Waiting State */}
                {!loadingAI && !aiResult && (
                  <Card className="h-full border-dashed border-2 bg-muted/10 flex flex-col items-center justify-center p-10 text-center">
                    <div className="bg-background shadow-sm p-5 rounded-full mb-6 border relative overflow-hidden group">
                      <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <Map className="h-12 w-12 text-muted-foreground/50 relative z-10" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 tracking-tight">System Ready</h3>
                    <p className="text-muted-foreground mb-8 max-w-[300px] text-sm">
                      Input your parameters on the left. The TrailSense engine will evaluate your safety profile based on:
                    </p>
                    
                    <div className="w-full space-y-5 max-w-[280px] text-left">
                      <div className="flex gap-4 items-start bg-background p-3 rounded-lg border shadow-sm">
                        <div className="mt-0.5"><Activity className="h-5 w-5 text-primary/70" /></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Cardio Baseline</p>
                          <p className="text-xs text-muted-foreground">Age & routine matching</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start bg-background p-3 rounded-lg border shadow-sm">
                        <div className="mt-0.5"><Mountain className="h-5 w-5 text-primary/70" /></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Terrain Topography</p>
                          <p className="text-xs text-muted-foreground">Elevation vs. past experience</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}