"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Mountain, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the User type used by your MongoDB Auth API
type MeUser = {
  id: string;
  email: string;
  fullName?: string;
  role?: "user" | "admin" | "guide";
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const userLinks = [
    { name: "Overview", path: "/" },
    { name: "Hikes", path: "/hikes" },
    { name: "Rentals", path: "/rentals" },
    { name: "Transport", path: "/transport" },
    { name: "Contact", path: "/contact" },
  ];

  // Fetch user data from your custom MongoDB API route
  useEffect(() => {
    let alive = true;

    async function checkMe() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });

        if (!res.ok) {
          if (alive) setUser(null);
          return;
        }

        const data = await res.json();
        if (alive) setUser(data.user ?? null);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    checkMe();
    return () => { alive = false; };
  }, [pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setProfileOpen(false);
      setMobileMenuOpen(false);
      router.push("/auth");
      router.refresh();
    }
  };

  const showUserLinks = !user || user.role === "user";

  const initials = useMemo(() => {
    const name = user?.fullName?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
    return (first + (second ?? "")).toUpperCase();
  }, [user?.fullName]);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Dynamic Logo Link based on Role */}
          <Link
            href={user?.role === "admin" || user?.role === "guide" ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <Mountain className="h-7 w-7" />
            <span className="text-xl font-bold">TrailSense</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {showUserLinks &&
              userLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>

                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen((v) => !v)}
                        className={cn(
                          "h-9 w-9 rounded-full border flex items-center justify-center bg-background hover:bg-accent transition",
                          profileOpen ? "ring-2 ring-primary/30" : ""
                        )}
                      >
                        <span className="text-sm font-semibold">{initials}</span>
                      </button>

                      {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-background shadow-lg overflow-hidden">
                          <div className="px-4 py-3 border-b">
                            <p className="text-sm font-semibold">{user.fullName || "User"}</p>
                            <p className="text-xs text-muted-foreground break-all">{user.email}</p>
                          </div>
                          <div className="p-1">
                            <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent">
                              <User className="h-4 w-4" /> Profile
                            </Link>
                            <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent">
                              <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                            <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent text-left">
                              <LogOut className="h-4 w-4" /> Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/auth">Sign In</Link>
                    </Button>
                    <Button variant="hero" size="default" asChild>
                      <Link href="/planner">Book Now</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              {showUserLinks &&
                userLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-2 text-sm rounded-md",
                      pathname === link.path ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}

              {!loading && (
                <div className="flex flex-col gap-2 mt-2">
                  {user ? (
                    <>
                      <Button variant="outline" className="mx-4" asChild>
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                      </Button>
                      <Button variant="outline" className="mx-4" asChild>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button variant="ghost" className="mx-4 justify-start" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="mx-4" asChild>
                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                      </Button>
                      <Button variant="hero" className="mx-4" asChild>
                        <Link href="/planner" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}