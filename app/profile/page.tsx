"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type MeDTO = {
  id: string;
  fullName: string;
  email: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeDTO | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    let alive = true;
    async function loadMe() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("Please login again.");
        const data = await res.json();
        const user = data?.user;
        if (!user?.id) throw new Error("Please login again.");

        if (alive) {
          setMe({ id: user.id, fullName: user.fullName || "", email: user.email || "" });
          setFullName(user.fullName || "");
          setEmail(user.email || "");
        }
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadMe();
    return () => { alive = false; };
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: me?.id, fullName, email }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setMsg("Profile details updated successfully.");
      setMe((p) => (p ? { ...p, fullName, email } : p));
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPass(true);
    setErr("");
    setMsg("");
    try {
      if (!currentPassword || !newPassword) throw new Error("Please fill all password fields");
      if (newPassword.length < 6) throw new Error("New password must be 6+ characters");
      if (newPassword !== confirmNewPassword) throw new Error("Passwords do not match");

      const res = await fetch("/api/users/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: me?.id, currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error("Failed to change password");
      setMsg("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e: any) {
      setErr(e?.message || "Password update failed");
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background mt-10">
      <Navigation />

      <main className="flex-1 py-12 md:py-20 bg-muted/10">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header & Avatar Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <User className="h-12 w-12" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your TrailSense identity and security preferences.</p>
            </div>
          </div>

          {/* Status Messages */}
          <div className="mb-6">
            {err && (
              <div className="flex items-center gap-2 p-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" /> {err}
              </div>
            )}
            {msg && (
              <div className="flex items-center gap-2 p-4 text-sm font-medium text-green-600 bg-green-500/10 border border-green-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4" /> {msg}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Fetching your credentials...</p>
            </div>
          ) : (
            <Tabs defaultValue="general" className="w-full space-y-8">
              <TabsList className="grid w-full md:w-[400px] grid-cols-2 h-12 p-1 bg-muted rounded-xl">
                <TabsTrigger value="general" className="rounded-lg data-[state=active]:shadow-sm">
                  <User className="h-4 w-4 mr-2" /> General
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg data-[state=active]:shadow-sm">
                  <Lock className="h-4 w-4 mr-2" /> Security
                </TabsTrigger>
              </TabsList>

              {/* General Settings Tab */}
              <TabsContent value="general" asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b pb-6">
                      <CardTitle className="text-xl">Personal Information</CardTitle>
                      <CardDescription>Update your public profile and contact email.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="fullName"
                              className="pl-10 h-11 bg-background"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              className="pl-10 h-11 bg-background"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardContent className="py-6 bg-muted/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Your email is used for permit delivery and booking notifications.
                        </p>
                        <Button
                          onClick={saveProfile}
                          disabled={savingProfile}
                          className="h-11 rounded-full px-8 shadow-sm"
                        >
                          {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Profile Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" asChild>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b pb-6">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Login Credentials
                      </CardTitle>
                      <CardDescription>Keep your account secure with a strong password.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                      <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPass">Current Password</Label>
                          <Input
                            id="currentPass"
                            type="password"
                            className="h-11 bg-background"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-2">
                          <Label htmlFor="newPass">New Password</Label>
                          <Input
                            id="newPass"
                            type="password"
                            className="h-11 bg-background"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPass">Confirm New Password</Label>
                          <Input
                            id="confirmPass"
                            type="password"
                            className="h-11 bg-background"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardContent className="py-6 bg-muted/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs text-muted-foreground max-w-xs">
                          After saving, you may be asked to re-authenticate.
                        </p>
                        <Button
                          variant="default"
                          onClick={changePassword}
                          disabled={savingPass}
                          className="h-11 rounded-full px-8 shadow-sm"
                        >
                          {savingPass && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Security
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}