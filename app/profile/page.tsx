"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type MeDTO = {
  id: string;
  fullName: string;
  email: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeDTO | null>(null);
  const [err, setErr] = useState("");

  // profile form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      setLoading(true);
      setErr("");
      setMsg("");

      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("Please login again.");
        const data = await res.json().catch(() => ({}));
        const user = data?.user;

        if (!user?.id) throw new Error("Please login again.");

        const loaded: MeDTO = {
          id: user.id,
          fullName: user.fullName || "",
          email: user.email || "",
        };

        if (!alive) return;
        setMe(loaded);
        setFullName(loaded.fullName);
        setEmail(loaded.email);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadMe();
    return () => {
      alive = false;
    };
  }, []);

  async function saveProfile() {
    if (!me) return;
    setSavingProfile(true);
    setErr("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: me.id,
          fullName,
          email,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to update profile");

      setMsg("Profile updated ✅");
      // refresh local copy
      setMe((p) => (p ? { ...p, fullName, email } : p));
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!me) return;
    setSavingPass(true);
    setErr("");
    setMsg("");

    try {
      if (!currentPassword || !newPassword) throw new Error("Fill all password fields");
      if (newPassword.length < 6) throw new Error("New password must be at least 6 characters");
      if (newPassword !== confirmNewPassword) throw new Error("New passwords do not match");

      const res = await fetch("/api/users/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: me.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to change password");

      setMsg("Password changed ✅");
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
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h1 className="text-3xl font-bold">My Profile</h1>

          {loading && <p className="text-muted-foreground">Loading...</p>}

          {!loading && err && (
            <div className="rounded-lg border p-4 text-sm text-red-500">{err}</div>
          )}

          {!loading && msg && (
            <div className="rounded-lg border p-4 text-sm text-emerald-700">{msg}</div>
          )}

          {!loading && me && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can allow email change or disable it if you want.
                    </p>
                  </div>

                  <Button onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </div>

                  <Button onClick={changePassword} disabled={savingPass}>
                    {savingPass ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
