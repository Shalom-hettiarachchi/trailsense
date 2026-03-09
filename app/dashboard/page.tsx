"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

import AdminDashboard from "@/components/dashboard/AdminDashboard";
import GuideDashboard from "@/components/dashboard/GuideDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";

export type MeUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "guide" | "user";
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });

        if (!res.ok) {
          router.replace("/auth");
          return;
        }

        const data = await res.json();
        if (!alive) return;

        setUser(data.user);
      } catch {
        router.replace("/auth");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {user.role === "admin" && <AdminDashboard user={user} />}
        {user.role === "guide" && <GuideDashboard user={user} />}
        {user.role === "user" && <UserDashboard user={user} />}
      </main>
      <Footer />
    </div>
  );
}
