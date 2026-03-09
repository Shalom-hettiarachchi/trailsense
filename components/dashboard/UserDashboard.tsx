"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { MeUser } from "@/app/dashboard/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Calendar,
  MapPin,
  Plus,
  Pencil,
  XCircle,
  Save,
  Loader2,
} from "lucide-react";

type Booking = {
  _id: string;
  hikeName: string;
  hikeDate?: string;
  bookingDate: string;
  numberOfPeople: number;
  status: "confirmed" | "pending" | "cancelled" | string;
  guide?: string;
  transport?: string;
  pickupLocation?: string;
};

// 2. Define DashboardProps to fix the Vercel Type Error
interface UserDashboardProps {
  user: MeUser;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHikeDate, setEditHikeDate] = useState("");
  const [editPeople, setEditPeople] = useState("1");
  const [editGuide, setEditGuide] = useState("none");
  const [editTransport, setEditTransport] = useState("none");
  const [editPickup, setEditPickup] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [editError, setEditError] = useState("");

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const fetchBookings = async (uid: string) => {
    const res = await fetch(`/api/bookings?userId=${uid}`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error("Failed to load bookings");
    return Array.isArray(json?.bookings) ? json.bookings : [];
  };

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!user?.id) return;
      try {
        setLoading(true);
        if (alive) setProfile(user);
        const list = await fetchBookings(user.id);
        if (!alive) return;
        setBookings(list);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [user?.id]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      if (!b.hikeDate) return false;
      const d = new Date(b.hikeDate);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }).length;
  }, [bookings]);

  const startEdit = async (b: Booking) => {
    const res = await fetch(`/api/bookings?bookingId=${b._id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    const booking = data.booking;

    setEditingId(booking._id);
    setEditHikeDate(booking.hikeDate || "");
    setEditPeople(String(booking.numberOfPeople || 1));
    setEditGuide(booking.guide || "none");
    setEditTransport(booking.transport || "none");
    setEditPickup(booking.pickupLocation || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = async (bookingId: string) => {
    setEditError("");
    const ppl = Number(editPeople);
    if (!editHikeDate) {
      setEditError("Please select a hike date");
      return;
    }
    if (!ppl || ppl < 1 || ppl > 20) {
      setEditError("People must be between 1-20");
      return;
    }
    setActionLoadingId(bookingId);
    try {
      await fetch("/api/bookings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          hikeDate: editHikeDate,
          numberOfPeople: ppl,
          guide: editGuide,
          transport: editTransport,
          pickupLocation: editPickup,
        }),
      });
      if (!user?.id) return;
      const list = await fetchBookings(user.id);
      setBookings(list);
      setEditingId(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const requestCancel = (b: Booking) => {
    setCancelTarget(b);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await fetch("/api/bookings/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: cancelTarget._id,
        status: "cancelled",
      }),
    });
    if (!user?.id) return;
    const list = await fetchBookings(user.id);
    setBookings(list);
    setCancelDialogOpen(false);
    setCancelTarget(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription>Cancel {cancelTarget?.hikeName}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep booking</Button>
            <Button variant="destructive" onClick={confirmCancel}>Confirm cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.fullName}</h1>
          <p className="text-muted-foreground">Manage your hiking adventures</p>
        </div>
        <Button asChild>
          <Link href="/planner"><Plus className="mr-2 h-4 w-4" /> Book New Hike</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>Total Bookings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{bookings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Upcoming Hikes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{upcomingCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Your Bookings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.map((b) => {
              const isEditing = editingId === b._id;
              const busy = actionLoadingId === b._id;
              return (
                <div key={b._id} className="border rounded-xl p-5 bg-card hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base">{b.hikeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {b.hikeDate ? new Date(b.hikeDate).toLocaleDateString() : "Date not set"} • {b.numberOfPeople} people
                      </p>
                    </div>
                    <Badge variant={b.status === "confirmed" ? "default" : b.status === "pending" ? "secondary" : "outline"}>
                      {b.status}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(b)} disabled={busy}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => requestCancel(b)} disabled={busy}><XCircle className="mr-2 h-4 w-4" /> Cancel</Button>
                  </div>

                  {isEditing && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/40 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input type="date" value={editHikeDate} onChange={(e) => setEditHikeDate(e.target.value)} />
                        <Input type="number" min="1" max="20" value={editPeople} onChange={(e) => setEditPeople(e.target.value)} />
                        <select value={editGuide} onChange={(e) => setEditGuide(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                          <option value="none">No Guide</option>
                          <option value="basic">Basic Guide</option>
                          <option value="expert">Expert Guide</option>
                        </select>
                        <select value={editTransport} onChange={(e) => setEditTransport(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                          <option value="none">No Transport</option>
                          <option value="car">Car</option>
                          <option value="van">Van</option>
                          <option value="jeep">Jeep</option>
                        </select>
                        {editTransport !== "none" && (
                          <Input placeholder="Pickup location" value={editPickup} onChange={(e) => setEditPickup(e.target.value)} />
                        )}
                      </div>
                      {editError && <p className="text-sm text-red-500">{editError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(b._id)} disabled={busy}>
                          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={busy}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {bookings.length === 0 && <p className="text-center text-muted-foreground py-10">No bookings yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}