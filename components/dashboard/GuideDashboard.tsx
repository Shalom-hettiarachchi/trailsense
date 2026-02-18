"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Calendar, MapPin, Eye } from "lucide-react";

type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "guide" | "user";
};

type Booking = {
  _id: string;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;

  hikeName: string;
  hikeDate?: string;
  hikeTime?: string;

  numberOfPeople: number;
  status: "confirmed" | "pending" | "cancelled" | string;

  guide?: string;
  transport?: string;
  pickupLocation?: string;
  gear?: string[];
};

interface GuideDashboardProps {
  user: AppUser | null;
}

export default function GuideDashboard({ user }: GuideDashboardProps) {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!user?.id) return;

      try {
        setLoading(true);

        // ✅ confirmed bookings only
        const res = await fetch("/api/bookings?status=confirmed", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

        const list: Booking[] = Array.isArray(data?.bookings) ? data.bookings : [];

        // ✅ only those where user selected a guide package (basic/expert)
        const withGuide = list.filter((b) => (b.guide || "none") !== "none");

        if (!alive) return;
        setItems(withGuide);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const prettyGuide = (g?: string) => {
    if (!g || g === "none") return "None";
    if (g === "basic") return "Basic";
    if (g === "expert") return "Expert";
    return g;
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return "—";
    return x.toLocaleDateString();
  };

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter((b) => {
      if (!b.hikeDate) return false;
      const d = new Date(b.hikeDate);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }).length;
  }, [items]);

  const openDetails = (b: Booking) => {
    setSelected(b);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading guide dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selected?.hikeName ? (
                <>
                  <b>{selected.hikeName}</b> • {formatDate(selected.hikeDate)}{" "}
                  {selected.hikeTime ? `• ${selected.hikeTime}` : ""}
                </>
              ) : (
                "—"
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-2 text-sm">
              <div><b>Customer:</b> {selected.customerName || selected.customerEmail || selected.userId || "Unknown"}</div>
              {selected.customerEmail && <div><b>Email:</b> {selected.customerEmail}</div>}
              {selected.customerPhone && <div><b>Phone:</b> {selected.customerPhone}</div>}
              <div><b>People:</b> {selected.numberOfPeople}</div>
              <div><b>Guide Package:</b> {prettyGuide(selected.guide)}</div>
              <div><b>Transport:</b> {selected.transport || "none"}</div>
              {selected.transport && selected.transport !== "none" && (
                <div><b>Pickup:</b> {selected.pickupLocation || "—"}</div>
              )}
              <div><b>Gear:</b> {Array.isArray(selected.gear) && selected.gear.length ? selected.gear.join(", ") : "—"}</div>
              <div className="text-xs text-muted-foreground pt-2">
                Booking ID: {selected._id}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1 className="text-3xl font-bold mb-8">Guide Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Hikes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings (Guide Selected)</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Hike</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Package</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b.customerName || b.customerEmail || b.userId || "Unknown"}</TableCell>
                  <TableCell>{b.customerPhone || "—"}</TableCell>
                  <TableCell>{b.hikeName}</TableCell>
                  <TableCell>{formatDate(b.hikeDate)}</TableCell>
                  <TableCell>{b.hikeTime || "—"}</TableCell>
                  <TableCell>{b.numberOfPeople}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{prettyGuide(b.guide)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openDetails(b)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    No confirmed bookings with guide selected yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
