"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

type ResultLevel = "beginner" | "intermediate" | "advanced";

export default function FitnessCheckPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    age: "",
    fitnessLevel: "",
    experience: "",
    medicalConcerns: "",
    activityLevel: "",
  });

  const [result, setResult] = useState<null | ResultLevel>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const experienceScore =
      formData.experience === "none" ? 0 : formData.experience === "few" ? 1 : 2;

    const fitnessScore =
      formData.fitnessLevel === "beginner"
        ? 0
        : formData.fitnessLevel === "moderate"
        ? 1
        : 2;

    const activityScore =
      formData.activityLevel === "sedentary"
        ? 0
        : formData.activityLevel === "moderate"
        ? 1
        : 2;

    const totalScore = experienceScore + fitnessScore + activityScore;

    if (totalScore <= 2) setResult("beginner");
    else if (totalScore <= 4) setResult("intermediate");
    else setResult("advanced");
  };

  const renderRecommendations = () => {
    if (!result) return null;

    const recommendations: Record<
      ResultLevel,
      {
        icon: React.ReactNode;
        title: string;
        description: string;
        trails: string[];
        tips: string[];
      }
    > = {
      beginner: {
        icon: <CheckCircle className="h-12 w-12 text-accent" />,
        title: "Start with Easy Trails",
        description:
          "Based on your profile, we recommend starting with our easier trails to build confidence and experience.",
        trails: ["Garandiella Mountain", "Kehelpathdoruwa Mountain"],
        tips: [
          "Start with shorter day hikes",
          "Consider hiring a guide for your first few hikes",
          "Build up your fitness gradually",
          "Practice on local trails before attempting longer hikes",
        ],
      },
      intermediate: {
        icon: <TrendingUp className="h-12 w-12 text-primary" />,
        title: "Ready for Moderate Challenges",
        description:
          "You have a good foundation! You're ready for moderate trails with some challenging sections.",
        trails: ["Kehelpathdoruwa Mountain", "Yahangala Mountain", "Kabaragala"],
        tips: [
          "Continue building endurance with regular training",
          "Consider multi-day hikes to test your stamina",
          "Learn basic navigation and safety skills",
          "Invest in quality hiking gear",
        ],
      },
      advanced: {
        icon: <TrendingUp className="h-12 w-12 text-primary" />,
        title: "Advanced Trails Await",
        description:
          "Excellent! Your fitness and experience level makes you ready for our most challenging trails.",
        trails: ["Knuckles 5 Peaks", "Yahangala Mountain", "Kabaragala"],
        tips: [
          "Challenge yourself with multi-peak adventures",
          "Consider becoming a trail mentor",
          "Explore less traveled routes",
          "Focus on technical skills and safety",
        ],
      },
    };

    const rec = recommendations[result];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center">
          {rec.icon}
          <h2 className="text-2xl font-bold mt-4 mb-2">{rec.title}</h2>
          <p className="text-muted-foreground">{rec.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Trails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rec.trails.map((trail) => (
                <Badge key={trail} variant="secondary" className="mr-2">
                  {trail}
                </Badge>
              ))}
            </div>
            <Button
              variant="hero"
              className="w-full mt-4"
              onClick={() => router.push("/hikes")}
            >
              Browse These Hikes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rec.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
            Retake Assessment
          </Button>
          <Button
            variant="adventure"
            onClick={() => router.push("/planner")}
            className="flex-1"
          >
            Plan My Hike
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <section className="bg-gradient-nature py-12 md:py-16 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find the Hike That Fits You</h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Tell us about your fitness, experience, and hiking background. We&apos;ll guide you to choose the
            right trail for your goals.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gradient-soft flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {!result ? (
            <Card>
              <CardHeader>
                <CardTitle>Fitness Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Fitness Level</Label>
                    <RadioGroup
                      value={formData.fitnessLevel}
                      onValueChange={(value) => setFormData({ ...formData, fitnessLevel: value })}
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="beginner" id="beginner" />
                        <Label htmlFor="beginner" className="cursor-pointer">
                          Beginner - Just starting out
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate" className="cursor-pointer">
                          Moderate - Regular exercise routine
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced" className="cursor-pointer">
                          Advanced - Very active and fit
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="experience">Past Hiking Experience</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => setFormData({ ...formData, experience: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No hiking experience</SelectItem>
                        <SelectItem value="few">A few short hikes</SelectItem>
                        <SelectItem value="several">Several day hikes</SelectItem>
                        <SelectItem value="experienced">Experienced hiker (multi-day treks)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activityLevel">Daily Activity Level</Label>
                    <Select
                      value={formData.activityLevel}
                      onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Mostly sedentary</SelectItem>
                        <SelectItem value="moderate">
                          Moderately active (walk/exercise 2-3 times/week)
                        </SelectItem>
                        <SelectItem value="active">Very active (exercise 4+ times/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="medicalConcerns">Any Medical Concerns? (Optional)</Label>
                    <Textarea
                      id="medicalConcerns"
                      placeholder="E.g., knee problems, altitude sensitivity, etc."
                      value={formData.medicalConcerns}
                      onChange={(e) => setFormData({ ...formData, medicalConcerns: e.target.value })}
                    />
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      This assessment is for guidance only. Please consult with a healthcare professional before
                      undertaking strenuous physical activity.
                    </p>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Get My Recommendations
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            renderRecommendations()
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
