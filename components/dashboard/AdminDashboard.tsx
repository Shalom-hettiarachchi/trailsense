"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import {
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  Clock,
  BarChart3,
  Trophy,
  User as UserIcon,
  Mountain,
  Backpack,
  RefreshCcw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

type Booking = {
  _id: string;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;

  hikeName: string;
  hikeId?: string;

  hikeDate?: string;
  hikeTime?: string;
  createdAt?: string;
  bookingDate?: string;

  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | string;

  guide?: string;
  transport?: string;
  pickupLocation?: string;

  totalCost?: number;
  baseHikeFee?: number
  rentalFee?: number
};

function toMoney(n: number) {
  return `LKR ${Math.round(n).toLocaleString()}`;
}

function safeDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  return dt.toLocaleString(undefined, { month: "short" });
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ✅ first-load vs refresh (prevents jump to top)
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");

  // Booking details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  // User history dialog
  const [userOpen, setUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const mountedRef = useRef(false);

  const fetchDashboardData = async (mode: "initial" | "refresh" = "refresh") => {
    try {
      setError("");
      if (mode === "initial") setInitialLoading(true);
      else setRefreshing(true);

      const res = await fetch("/api/bookings", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || `Failed to load bookings (${res.status})`);
      }

      setBookings(Array.isArray(json?.bookings) ? json.bookings : []);
    } catch (e: any) {
      setBookings([]);
      setError(e?.message || "Failed to load bookings");
    } finally {
      if (mode === "initial") setInitialLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchDashboardData("initial");
  }, []);

  const formatDate = (b: Booking) => {
    const v = b.hikeDate || b.createdAt || b.bookingDate;
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  const prettyGuide = (g?: string) => {
    if (!g || g === "none") return "None";
    if (g === "basic") return "Basic";
    if (g === "expert") return "Expert";
    return g;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return bookings
      .filter((b) => (statusFilter === "all" ? true : b.status === statusFilter))
      .filter((b) => {
        if (!query) return true;

        const hay = [
          b.hikeName,
          b.customerName,
          b.customerEmail,
          b.customerPhone,
          b.userId,
          b.status,
          b.guide,
          b.hikeTime,
          b.hikeDate,
          String(b.totalCost ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(query);
      });
  }, [bookings, q, statusFilter]);

  async function patchStatus(id: string, status: "confirmed" | "cancelled") {
    setError("");
    setActionLoadingId(id);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

      // refresh without unmount -> no scroll jump
      await fetchDashboardData("refresh");
    } catch (e: any) {
      setError(e?.message || "Failed to update booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function removeBooking(id: string) {
    setError("");
    setActionLoadingId(id);

    try {
      const res = await fetch("/api/bookings/update", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);

      await fetchDashboardData("refresh");
    } catch (e: any) {
      setError(e?.message || "Failed to delete booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  const openDetails = (b: Booking) => {
    setSelected(b);
    setDetailsOpen(true);
  };

  const openUser = (userId?: string) => {
    if (!userId) return;
    setSelectedUserId(userId);
    setUserOpen(true);
  };

  const isRevenueBooking = (b: Booking) => b.status === "confirmed";

  const analytics = useMemo(() => {
    const now = new Date();

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
    const totalUsers = new Set(bookings.map((b) => b.userId).filter(Boolean)).size;

    let totalRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;

    const revenueByMonth = new Map<string, number>();
    const bookingsByDay = new Map<string, number>();

    // init last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      bookingsByDay.set(ymd(d), 0);
    }

    bookings.forEach((b) => {
  const d = safeDate(b.createdAt || b.bookingDate || b.hikeDate) || null;

  // Admin profit = hike fee + rental fee only
  const cost =
    Number(b.totalCost || 0)

  // bookings per day
  if (d) {
    const key = ymd(d);
    if (bookingsByDay.has(key)) {
      bookingsByDay.set(key, (bookingsByDay.get(key) || 0) + 1);
    }
  }

  if (!isRevenueBooking(b)) return;

  totalRevenue += cost;

  if (d) {
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) weeklyRevenue += cost;
    if (diffDays <= 30) monthlyRevenue += cost;

    const mKey = monthKey(d);
    revenueByMonth.set(mKey, (revenueByMonth.get(mKey) || 0) + cost);
  }
});

    // last 6 months chart
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(monthKey(d));
    }

    const revenueChart = months.map((m) => ({
      month: monthLabel(m),
      revenue: Math.round(revenueByMonth.get(m) || 0),
    }));

    const bookingsChart = Array.from(bookingsByDay.entries()).map(([day, count]) => {
      const dt = new Date(day);
      return {
        day: dt.toLocaleString(undefined, { weekday: "short" }),
        bookings: count,
      };
    });

    // top hikes
    const hikeCount = new Map<string, number>();
    const hikeRevenue = new Map<string, number>();

   bookings.forEach((b) => {
    hikeCount.set(b.hikeName, (hikeCount.get(b.hikeName) || 0) + 1);

    if (isRevenueBooking(b)) {
      const profit =
        Number(b.totalCost || 0)

      hikeRevenue.set(
        b.hikeName,
        (hikeRevenue.get(b.hikeName) || 0) + profit
      );
    }
  });

    const topHikes = Array.from(hikeCount.entries())
      .map(([name, count]) => ({
        name,
        count,
        revenue: Math.round(hikeRevenue.get(name) || 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // top users
    const userCount = new Map<string, number>();
    const userRevenue = new Map<string, number>();
    const userLabel = (b: Booking) => b.customerName || b.customerEmail || b.userId || "Unknown";

    bookings.forEach((b) => {
     const id = b.userId || "unknown";

      userCount.set(id, (userCount.get(id) || 0) + 1);

      if (isRevenueBooking(b)) {
        const profit =
          Number(b.totalCost || 0)

        userRevenue.set(
          id,
          (userRevenue.get(id) || 0) + profit
        );
      }
    });

    const topUsers = Array.from(userCount.entries())
      .map(([id, count]) => {
        const sample = bookings.find((b) => (b.userId || "unknown") === id);
        return {
          id,
          label: sample ? userLabel(sample) : id,
          count,
          revenue: Math.round(userRevenue.get(id) || 0),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers,
      totalRevenue,
      weeklyRevenue,
      monthlyRevenue,
      revenueChart,
      bookingsChart,
      topHikes,
      topUsers,
    };
  }, [bookings]);

  const userHistory = useMemo(() => {
    if (!selectedUserId) return null;

    const list = bookings
      .filter((b) => b.userId === selectedUserId)
      .sort((a, b) => {
        const da = safeDate(a.createdAt || a.bookingDate || a.hikeDate)?.getTime() || 0;
        const db = safeDate(b.createdAt || b.bookingDate || b.hikeDate)?.getTime() || 0;
        return db - da;
      });

    const revenue = list
      .filter(isRevenueBooking)
      .reduce((s, b) => s + Number(b.totalCost || 0), 0);

    const label = list[0]?.customerName || list[0]?.customerEmail || list[0]?.userId || selectedUserId;

    return { label, count: list.length, revenue, list };
  }, [bookings, selectedUserId]);

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Booking Details dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selected?.hikeName ? (
                <>
                  <b>{selected.hikeName}</b> • {formatDate(selected)}
                  {selected?.hikeTime ? ` • ${selected.hikeTime}` : ""}
                </>
              ) : (
                "—"
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-2 text-sm">
              <div>
                <b>User:</b>{" "}
                {selected.customerName || selected.customerEmail || selected.userId || "Unknown"}
              </div>

              {selected.customerEmail && (
                <div>
                  <b>Email:</b> {selected.customerEmail}
                </div>
              )}

              {selected.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <b>Phone:</b> {selected.customerPhone}
                  </span>
                </div>
              )}

              {selected.hikeTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <b>Time:</b> {selected.hikeTime}
                  </span>
                </div>
              )}

              <div>
                <b>People:</b> {selected.numberOfPeople}
              </div>

              <div className="flex items-center gap-2">
                <b>Status:</b>
                <Badge
                  variant={
                    selected.status === "confirmed"
                      ? "default"
                      : selected.status === "pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {selected.status}
                </Badge>
              </div>

              <div>
                <b>Guide:</b> {prettyGuide(selected.guide)}
              </div>

              <div>
                <b>Transport:</b> {selected.transport || "none"}
              </div>

              {selected.transport && selected.transport !== "none" && (
                <div>
                  <b>Pickup:</b> {selected.pickupLocation || "—"}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{toMoney(Number(selected.totalCost || 0))}</span>
              </div>

              <div className="text-xs text-muted-foreground pt-2">
                Booking ID: {selected._id}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User History dialog */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Hike History</DialogTitle>
            <DialogDescription>
              {userHistory ? (
                <>
                  <b>{userHistory.label}</b> • {userHistory.count} bookings • Revenue{" "}
                  <b>{toMoney(userHistory.revenue)}</b>
                </>
              ) : (
                "—"
              )}
            </DialogDescription>
          </DialogHeader>

          {userHistory && (
            <div className="space-y-3">
              <div className="max-h-[360px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hike</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userHistory.list.map((b) => (
                      <TableRow key={b._id}>
                        <TableCell>{formatDate(b)}</TableCell>
                        <TableCell>{b.hikeName}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-right">{toMoney(Number(b.totalCost || 0))}</TableCell>
                      </TableRow>
                    ))}

                    {userHistory.list.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Manage bookings, approvals, and analytics.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/hikes">
              <Mountain className="mr-2 h-4 w-4" />
              Manage Hikes
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/admin/rentals">
              <Backpack className="mr-2 h-4 w-4" />
              Manage Rentals
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => fetchDashboardData("refresh")}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error && <div className="mb-6 text-sm text-red-500">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.confirmedBookings}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit (Hike Fee + Rentals)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{toMoney(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Counts only <b>confirmed</b> bookings.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toMoney(analytics.weeklyRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toMoney(analytics.monthlyRevenue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table (where charts used to be) */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <Input
          placeholder="Search by hike, user, email, phone, status, guide..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:max-w-sm"
        />

        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Hike</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>People</TableHead>
                <TableHead>Guide</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((b) => {
                const busy = actionLoadingId === b._id;

                return (
                  <TableRow key={b._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{b.customerName || b.customerEmail || b.userId || "Unknown"}</span>
                        {b.userId && (
                          <button
                            className="text-xs text-primary hover:underline w-fit"
                            onClick={() => openUser(b.userId)}
                          >
                            View user hikes
                          </button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{b.customerPhone || b.customerEmail || "—"}</TableCell>
                    <TableCell>{b.hikeName}</TableCell>
                    <TableCell>{formatDate(b)}</TableCell>
                    <TableCell>{b.hikeTime || "—"}</TableCell>
                    <TableCell>{b.numberOfPeople}</TableCell>
                    <TableCell>{prettyGuide(b.guide)}</TableCell>

                    <TableCell>
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
                    </TableCell>

                    <TableCell className="text-right">{toMoney(Number(b.totalCost || 0))}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => openDetails(b)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        {b.userId && (
                          <Button size="sm" variant="secondary" onClick={() => openUser(b.userId)}>
                            <Users className="mr-2 h-4 w-4" />
                            User
                          </Button>
                        )}

                        {b.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => patchStatus(b._id, "confirmed")}
                            disabled={busy}
                          >
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm
                          </Button>
                        )}

                        {b.status !== "cancelled" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => patchStatus(b._id, "cancelled")}
                            disabled={busy}
                          >
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeBooking(b._id)}
                            disabled={busy}
                          >
                            {busy ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts down */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit/Revenue (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => toMoney(Number(v || 0))} />
                <Bar dataKey="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bookings (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.bookingsChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Hikes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topHikes.map((h) => (
                <div
                  key={h.name}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.count} bookings • Revenue {toMoney(h.revenue)}
                    </div>
                  </div>
                  <Badge variant="secondary">{h.count}</Badge>
                </div>
              ))}
              {analytics.topHikes.length === 0 && (
                <div className="text-sm text-muted-foreground">No data yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => openUser(u.id === "unknown" ? undefined : u.id)}
                  className="w-full text-left flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted"
                >
                  <div>
                    <div className="font-medium line-clamp-1">{u.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.count} bookings • Revenue {toMoney(u.revenue)}
                    </div>
                  </div>
                  <Badge variant="secondary">{u.count}</Badge>
                </button>
              ))}
              {analytics.topUsers.length === 0 && (
                <div className="text-sm text-muted-foreground">No data yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
