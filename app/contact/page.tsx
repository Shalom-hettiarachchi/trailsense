"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for presentation purposes
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Form submitted");
    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-muted/30 border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6 text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Have questions about a trail? Need help planning your expedition? Our local experts are here to help you navigate.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-16 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Left Column: Form (Takes up 3/5 width on desktop) */}
            <div className="lg:col-span-3">
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-card pb-8">
                  <CardTitle className="text-2xl">Send a Message</CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
                      <div className="h-16 w-16 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Thank you for reaching out. A TrailSense guide will review your message and reply to your email shortly.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-8 rounded-full"
                        onClick={() => setIsSuccess(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" placeholder="John Doe" required className="bg-muted/50 h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" placeholder="john@example.com" required className="bg-muted/50 h-12" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                          <Input id="phone" type="tel" placeholder="+94 77 000 0000" className="bg-muted/50 h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input id="subject" placeholder="e.g. Hiking Gear Inquiry" required className="bg-muted/50 h-12" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea 
                          id="message" 
                          placeholder="How can we help you prepare for your adventure?" 
                          rows={6} 
                          required 
                          className="bg-muted/50 resize-none"
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px] h-12 rounded-full text-base" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Contact Info (Takes up 2/5 width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Direct Contact Card */}
              <Card className="border-border/50 shadow-sm rounded-2xl bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:info@trailsense.lk" className="text-sm text-muted-foreground hover:text-primary transition-colors">info@trailsense.lk</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+94771234567" className="text-sm text-muted-foreground hover:text-primary transition-colors">+94 77 123 4567</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Headquarters</p>
                      <p className="text-sm text-muted-foreground">123 Adventure Lane<br/>Colombo 03, Sri Lanka</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours & Socials */}
              <Card className="border-border/50 shadow-sm rounded-2xl bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">9:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sunday</span>
                      <Badge variant="secondary" className="text-xs">Closed</Badge>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">Follow Our Journeys</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}