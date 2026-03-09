"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Mountain, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Your original Hero Section */}
      <section className="bg-gradient-nature py-12 md:py-16 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">AI Hike Fitness Checker</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Tell us about your fitness and experience. Our AI will analyze if you are ready to climb your chosen hike.
          </p>
        </div>
      </section>

      {/* Main Content: Two-column layout to remove "empty" feel */}
      <section className="py-12 bg-gradient-soft flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left: Your original Form */}
            <Card>
              <CardHeader>
                <CardTitle>Fitness Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label>Which hike are you planning?</Label>
                    <Select value={formData.hike} onValueChange={(v) => setFormData({ ...formData, hike: v })} required>
                      <SelectTrigger><SelectValue placeholder="Select a hike" /></SelectTrigger>
                      <SelectContent>
                        {["Yahangala Mountain", "Knuckles 5 Peaks", "Kabaragala", "Garandiella Mountain", "Kehelpathdoruwa Mountain"].map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Age</Label>
                    <Input type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                  </div>

                  <div>
                    <Label>Fitness Level</Label>
                    <RadioGroup value={formData.fitnessLevel} onValueChange={(v) => setFormData({ ...formData, fitnessLevel: v })} required>
                      {["beginner", "moderate", "advanced"].map(level => (
                        <div key={level} className="flex items-center space-x-2">
                          <RadioGroupItem value={level} id={level} />
                          <Label htmlFor={level} className="capitalize">{level}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Past Hiking Experience</Label>
                      <Select value={formData.experience} onValueChange={(v) => setFormData({ ...formData, experience: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No experience</SelectItem>
                          <SelectItem value="few">Few short hikes</SelectItem>
                          <SelectItem value="several">Several day hikes</SelectItem>
                          <SelectItem value="experienced">Experienced hiker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Daily Activity Level</Label>
                      <Select value={formData.activityLevel} onValueChange={(v) => setFormData({ ...formData, activityLevel: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Mostly sedentary</SelectItem>
                          <SelectItem value="moderate">Active 2-3 times/week</SelectItem>
                          <SelectItem value="active">Active 4+ times/week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Medical Concerns (Optional)</Label>
                    <Textarea placeholder="E.g. knee problems, altitude sensitivity" value={formData.medicalConcerns} onChange={(e) => setFormData({ ...formData, medicalConcerns: e.target.value })} />
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-1" />
                    <p className="text-sm text-muted-foreground">This assessment is AI-generated guidance only. Consult a doctor before strenuous activity.</p>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loadingAI}>
                    {loadingAI ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI is analyzing...</> : "Check My Fitness"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Dynamic Result or Info Placeholder */}
            <div className="space-y-6 sticky top-8">
              {aiResult ? (
                <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-right-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="text-primary" />
                      AI Fitness Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                      <ReactMarkdown>{aiResult}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed bg-transparent border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground min-h-[400px]">
                  <Mountain className="h-12 w-12 mb-4 opacity-20" />
                  <p className="max-w-[250px]">Fill out the assessment to see your personalized hiking readiness report.</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}