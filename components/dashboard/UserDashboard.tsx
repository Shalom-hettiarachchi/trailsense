"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

import { Calendar, MapPin, Plus, Pencil, XCircle, Save, Loader2 } from "lucide-react";

type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "guide" | "user";
};

type Booking = {
  _id: string;
  hikeName: string;
  bookingDate: string;
  hikeDate?: string;
  numberOfPeople: number;
  status: "confirmed" | "pending" | "cancelled" | string;
};

interface UserDashboardProps {
  user: AppUser | null;
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHikeDate, setEditHikeDate] = useState("");
  const [editPeople, setEditPeople] = useState("1");
  const [editError, setEditError] = useState("");

  // ✅ UI Cancel Dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const fetchBookings = async (uid: string) => {
    const bookingsRes = await fetch(`/api/bookings?userId=${encodeURIComponent(uid)}`, {
      cache: "no-store",
    });

    const bookingsJson = await bookingsRes.json().catch(() => ({}));
    if (!bookingsRes.ok) throw new Error(bookingsJson?.message || "Failed to load bookings");

    return Array.isArray(bookingsJson?.bookings) ? bookingsJson.bookings : [];
  };

  useEffect(() => {
    let alive = true;

    async function fetchUserData() {
      if (!user?.id) return;

      try {
        setLoading(true);
        setGlobalError("");

        if (alive) setProfile(user);

        const list = await fetchBookings(user.id);
        if (!alive) return;

        setBookings(list);
      } catch (e: any) {
        if (!alive) return;
        setProfile(user);
        setBookings([]);
        setGlobalError(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchUserData();

    return () => {
      alive = false;
    };
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

  const startEdit = (b: Booking) => {
    setGlobalError("");
    setEditError("");
    setEditingId(b._id);
    setEditHikeDate(b.hikeDate || "");
    setEditPeople(String(b.numberOfPeople || 1));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = async (bookingId: string) => {
    setEditError("");
    setGlobalError("");

    if (!editHikeDate) {
      setEditError("Please choose a hike date.");
      return;
    }

    const ppl = Number(editPeople);
    if (!ppl || ppl < 1 || ppl > 20) {
      setEditError("Number of people must be between 1 and 20.");
      return;
    }

    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          hikeDate: editHikeDate,
          numberOfPeople: ppl,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

      if (!user?.id) return;
      const list = await fetchBookings(user.id);
      setBookings(list);

      setEditingId(null);
    } catch (e: any) {
      setEditError(e?.message || "Update failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ✅ open UI dialog
  const requestCancel = (b: Booking) => {
    setGlobalError("");
    setCancelTarget(b);
    setCancelDialogOpen(true);
  };

  // ✅ do cancel after confirm
  const confirmCancel = async () => {
    if (!cancelTarget?._id) return;

    const bookingId = cancelTarget._id;

    setActionLoadingId(bookingId);
    setGlobalError("");

    try {
      const res = await fetch(`/api/bookings/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status: "cancelled",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

      if (!user?.id) return;
      const list = await fetchBookings(user.id);
      setBookings(list);

      setCancelDialogOpen(false);
      setCancelTarget(null);
    } catch (e: any) {
      setGlobalError(e?.message || "Cancel failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ✅ Cancel confirmation dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription>
              {cancelTarget ? (
                <>
                  You’re about to cancel <b>{cancelTarget.hikeName}</b>.
                  <br />
                  This action can’t be undone.
                </>
              ) : (
                "Are you sure you want to cancel this booking?"
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelTarget(null);
              }}
              disabled={!!actionLoadingId}
            >
              Keep booking
            </Button>

            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={!cancelTarget || actionLoadingId === cancelTarget?._id}
            >
              {actionLoadingId === cancelTarget?._id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.fullName || "Explorer"}!</h1>
          <p className="text-muted-foreground">Manage your hiking adventures</p>
        </div>

        <Button asChild>
          <Link href="/hikes">
            <Plus className="mr-2 h-4 w-4" />
            Book New Hike
          </Link>
        </Button>
      </div>

      {globalError && <div className="mb-6 text-sm text-red-500">{globalError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hikes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>

        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <Button asChild>
                <Link href="/hikes">Browse Hikes</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => {
                const isEditing = editingId === b._id;
                const isCancelled = b.status === "cancelled";
                const isBusy = actionLoadingId === b._id;

                return (
                  <div key={b._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{b.hikeName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {b.hikeDate
                            ? `${new Date(b.hikeDate).toLocaleDateString()} (Hike Date)`
                            : `${new Date(b.bookingDate).toLocaleDateString()} (Booked)`}{" "}
                          • {b.numberOfPeople} people
                        </p>
                      </div>

                      <Badge
                        variant={
                          b.status === "confirmed"
                            ? "default"
                            : b.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(b)}
                        disabled={isCancelled || isBusy}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => requestCancel(b)}
                        disabled={isCancelled || isBusy}
                      >
                        {isBusy ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel
                      </Button>
                    </div>

                    {isEditing && (
                      <div className="mt-4 p-4 rounded-lg bg-accent/20 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Hike Date</p>
                            <Input
                              type="date"
                              value={editHikeDate}
                              onChange={(e) => setEditHikeDate(e.target.value)}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">People</p>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={editPeople}
                              onChange={(e) => setEditPeople(e.target.value)}
                            />
                          </div>
                        </div>

                        {editError && <p className="text-sm text-red-500">{editError}</p>}

                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(b._id)} disabled={isBusy}>
                            {isBusy ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>

                          <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isBusy}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
