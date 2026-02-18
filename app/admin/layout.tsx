import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Home, Mountain, Tent, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Admin Navbar */}
      <div className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Admin
            </Badge>
            <p className="font-semibold">TrailSense Admin</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/hikes">
                <Mountain className="mr-2 h-4 w-4" />
                Hikes
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/rentals">
                <Tent className="mr-2 h-4 w-4" />
                Rentals
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Main Site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Optional sub-bar with back */}
      <div className="container mx-auto px-4 pt-4">
        <Card className="p-3 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground">
            Tip: Use /admin/hikes and /admin/rentals to manage database content.
          </p>
        </Card>
      </div>

      {/* Page content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
