"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Mountain, Menu, LogOut, User, LayoutDashboard, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle-btn";

type MeUser = {
  id: string;
  email: string;
  fullName?: string;
  role?: "user" | "admin" | "guide";
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const userLinks = [
    { name: "Overview", path: "/" },
    { name: "Hikes", path: "/hikes" },
    { name: "Rentals", path: "/rentals" },
    { name: "Transport", path: "/transport" },
    { name: "Contact", path: "/contact" },
  ];

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user data
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
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
    // 1. Wrapper is now just a positioning anchor. It uses pointer-events-none 
    // so clicks pass through the invisible space around the floating pill.
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      
      {/* 2. ALL transitions happen on this single nav element */}
      <nav className={cn(
        "pointer-events-auto bg-card/90 backdrop-blur-lg flex items-center justify-between transition-all duration-500 ease-out",
        isScrolled 
          ? "mt-4 h-14 w-[calc(100%-2rem)] max-w-6xl rounded-full border border-border shadow-lg px-6" 
          : "mt-0 h-16 w-full max-w-full rounded-none border-b border-border px-4 sm:px-6 lg:px-8"
      )}>
        
        {/* Dynamic Logo */}
        <Link
          href={user?.role === "admin" || user?.role === "guide" ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
        >
          <Mountain className="h-6 w-6 shrink-0" />
          <span className="text-xl font-bold tracking-tight">TrailSense</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {showUserLinks &&
            userLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
        </div>

        {/* Desktop Auth/User Area */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-colors cursor-pointer">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.fullName || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" /> Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full" asChild>
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button variant="default" size="sm" className="rounded-full" asChild>
                    <Link href="/planner">Book Now</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Trigger & Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] flex flex-col">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="flex items-center gap-2 text-primary">
                <Mountain className="h-6 w-6" />
                TrailSense
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-2 flex-1">
              {showUserLinks &&
                userLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "px-4 py-3 text-base font-medium rounded-xl transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.name}
                    </Link>
                  );
                })}
            </div>

            {!loading && (
              <div className="flex flex-col gap-3 pt-6 border-t mt-auto">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.fullName || "User"}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/planner" onClick={() => setMobileMenuOpen(false)}>
                        <CalendarCheck className="mr-2 h-4 w-4" /> Book Now
                      </Link>
                    </Button>
                  </>
                )}
              </div>

            )}
            
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}