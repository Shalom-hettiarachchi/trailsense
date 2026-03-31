"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import { toast } from "sonner";

// TanStack React Table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";

import { MeUser } from "@/app/dashboard/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  EyeOff,
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
  UserPlus,
  ArrowUpDown,
  Search,
  Settings,
  Mail,
  MapPin,
  Pencil,
  GraduationCap,
  Plus,
  AlertCircle
} from "lucide-react";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { cn } from "@/lib/utils";

interface DashboardProps {
  user: MeUser;
}

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
  guide?: string; // What the user requested ("none", "basic", "expert")
  assignedGuideId?: string; // The actual guide assigned by admin
  transport?: string;
  pickupLocation?: string;
  totalCost?: number;
  hikeFee?: number;
  gearCost?: number;
  gearQty?: Record<string, number>;
};

type Guide = {
  _id: string;
  name: string;
  email: string;
  experienceLevel?: "basic" | "expert" | string;
};

function toMoney(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
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

// Helper for status badges
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed": return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none">Confirmed</Badge>;
    case "pending": return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 shadow-none">Pending</Badge>;
    case "cancelled": return <Badge variant="outline" className="text-muted-foreground line-through shadow-none">Cancelled</Badge>;
    default: return <Badge variant="secondary" className="shadow-none">{status}</Badge>;
  }
};

export default function AdminDashboard({ user }: DashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const [userOpen, setUserOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Alert Dialog States
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "booking" | "guide" } | null>(null);

  // Confirm Booking State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Booking | null>(null);
  const [assignedGuide, setAssignedGuide] = useState<string>("none");

  // Guide States
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [guideForm, setGuideForm] = useState({ 
    _id: "", 
    name: "", 
    email: "", 
    password: "",
    experienceLevel: "basic" 
  });
  const [guideSaving, setGuideSaving] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Chart State
  const [chartTimeframe, setChartTimeframe] = useState<"7d" | "30d">("7d");

  // Data Table States
  const [sorting, setSorting] = useState<SortingState>([{ id: "bookingDate", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");

  const mountedRef = useRef(false);

  const fetchDashboardData = async (mode: "initial" | "refresh" = "refresh") => {
    try {
      setError("");
      if (mode === "initial") setInitialLoading(true);
      else setRefreshing(true);
      const res = await fetch("/api/bookings", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `Failed to load bookings`);
      setBookings(Array.isArray(json?.bookings) ? json.bookings : []);
    } catch (e: any) {
      setBookings([]);
      setError(e?.message || "Failed to load bookings");
    } finally {
      if (mode === "initial") setInitialLoading(false);
      else setRefreshing(false);
    }
  };

  const loadGuides = async () => {
    try {
      const res = await fetch("/api/guides", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setGuides(data.guides || []);
    } catch (e) {
      console.error("Failed to load guides", e);
    }
  };

  const saveGuide = async () => {
    if (!guideForm.name || !guideForm.email) return setGuideError("Name and Email are required");
    setGuideSaving(true);
    setGuideError("");
    try {
      const isEdit = !!guideForm._id;
      const url = isEdit ? "/api/guides/update" : "/api/guides";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...guideForm, id: guideForm._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save guide");
      resetGuideForm();
      loadGuides();
      toast.success(guideForm._id ? "Guide updated" : "New guide onboarded");
    } catch (e: any) {
      setGuideError(e.message);
    } finally {
      setGuideSaving(false);
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      const res = await fetch("/api/guides/update", {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) loadGuides();
    } catch (e) {
      console.error("Failed to delete guide", e);
    }
  };

  const resetGuideForm = () => {
    setGuideForm({ _id: "", name: "", email: "", password: "", experienceLevel: "basic" });
    setShowPassword(false);
    setGuideError("");
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchDashboardData("initial");
    loadGuides();
  }, []);

  const formatDate = (b: Booking | null | undefined) => {
    if (!b) return "—";
    const v = b.hikeDate || b.createdAt || b.bookingDate;
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : format(d, "MMM do, yyyy");
  };

  const prettyGuide = (g?: string) => {
    if (!g || g === "none") return "None";
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

  const openConfirmModal = (b: Booking) => {
    setConfirmTarget(b);
    setAssignedGuide("none");
    setConfirmOpen(true);
  };

  const requestDeleteBooking = (id: string) => {
    setItemToDelete({ id, type: "booking" });
    setDeleteAlertOpen(true);
  };

  const requestDeleteGuide = (id: string) => {
    setItemToDelete({ id, type: "guide" });
    setDeleteAlertOpen(true);
  };

const handleConfirmDelete = async () => {
  if (!itemToDelete) return;

  const promise = itemToDelete.type === "booking" 
    ? removeBooking(itemToDelete.id) 
    : deleteGuide(itemToDelete.id);

  toast.promise(promise, {
    loading: 'Deleting record...',
    success: 'Successfully removed from database',
    error: 'Failed to delete record',
  });

  setDeleteAlertOpen(false);
  setItemToDelete(null);
};

  async function submitConfirm() {
    if (!confirmTarget) return;
    setActionLoadingId(confirmTarget._id);
    try {
      const res = await fetch("/api/bookings/update", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: confirmTarget._id, 
          status: "confirmed",
          assignedGuideId: assignedGuide !== "none" ? assignedGuide : undefined 
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      await fetchDashboardData("refresh");
      setConfirmOpen(false);
      setConfirmTarget(null);
      setDetailsOpen(false);
      toast.success("Expedition confirmed and guide assigned");
    } catch (e: any) {
      setError(e?.message || "Failed to confirm booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function patchStatus(id: string, status: "cancelled") {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/bookings/update", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Request failed");
      await fetchDashboardData("refresh");
      setDetailsOpen(false); 
    } catch (e: any) {
      setError(e?.message || "Failed to update booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function removeBooking(id: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/bookings/update", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Request failed");
      await fetchDashboardData("refresh");
      setDetailsOpen(false);
    } catch (e: any) {
      setError(e?.message || "Failed to delete booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  const openDetails = (b: Booking) => { setSelected(b); setDetailsOpen(true); };
  const openUser = (userId?: string) => { if (userId) { setSelectedUserId(userId); setUserOpen(true); } };
  const isRevenueBooking = (b: Booking) => b.status === "confirmed";

  const analytics = useMemo(() => {
    const now = new Date();
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const totalUsers = new Set(bookings.map((b) => b.userId).filter(Boolean)).size;

    let totalRevenue = 0;
    const dailyRevenue30d = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dailyRevenue30d.set(ymd(d), 0);
    }

    bookings.forEach((b) => {
      const d = safeDate(b.createdAt || b.bookingDate || b.hikeDate);
      const cost = Number(b.hikeFee || 0) + Number(b.gearCost || 0);
      if (!isRevenueBooking(b)) return;
      totalRevenue += cost;
      if (d) {
        const key = ymd(d);
        if (dailyRevenue30d.has(key)) dailyRevenue30d.set(key, (dailyRevenue30d.get(key) || 0) + cost);
      }
    });

    const revenueChartData = Array.from(dailyRevenue30d.entries()).map(([day, rev]) => ({
      date: format(new Date(day), "MMM dd"),
      revenue: Math.round(rev),
    }));

    const hikeCount = new Map<string, number>();
    const hikeRevenue = new Map<string, number>();
    bookings.forEach((b) => {
      hikeCount.set(b.hikeName, (hikeCount.get(b.hikeName) || 0) + 1);
      if (isRevenueBooking(b)) {
        const profit = Number(b.hikeFee || 0) + Number(b.gearCost || 0);
        hikeRevenue.set(b.hikeName, (hikeRevenue.get(b.hikeName) || 0) + profit);
      }
    });

    const topHikes = Array.from(hikeCount.entries())
      .map(([name, count]) => ({ name, count, revenue: Math.round(hikeRevenue.get(name) || 0) }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const userCount = new Map<string, number>();
    const userRevenue = new Map<string, number>();
    bookings.forEach((b) => {
      const id = b.userId || "unknown";
      userCount.set(id, (userCount.get(id) || 0) + 1);
      if (isRevenueBooking(b)) {
        const profit = Number(b.hikeFee || 0) + Number(b.gearCost || 0);
        userRevenue.set(id, (userRevenue.get(id) || 0) + profit);
      }
    });

    const topUsers = Array.from(userCount.entries())
      .map(([id, count]) => {
        const sample = bookings.find((b) => (b.userId || "unknown") === id);
        return { id, label: sample?.customerName || sample?.customerEmail || id, count, revenue: Math.round(userRevenue.get(id) || 0) };
      })
      .sort((a, b) => b.count - a.count).slice(0, 5);

    return { totalBookings, pendingBookings, confirmedBookings, totalUsers, totalRevenue, revenueChartData, topHikes, topUsers };
  }, [bookings]);

  const userHistory = useMemo(() => {
    if (!selectedUserId) return null;
    const list = bookings.filter((b) => b.userId === selectedUserId)
      .sort((a, b) => (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0));
    const revenue = list.filter(isRevenueBooking).reduce((s, b) => s + (Number(b.hikeFee || 0) + Number(b.gearCost || 0)), 0);
    return { label: list[0]?.customerName || selectedUserId, count: list.length, revenue, list };
  }, [bookings, selectedUserId]);

  const displayedChartData = useMemo(() => 
    chartTimeframe === "7d" ? analytics.revenueChartData.slice(-7) : analytics.revenueChartData
  , [analytics.revenueChartData, chartTimeframe]);

  const columns = useMemo<ColumnDef<Booking>[]>(() => [
    {
      accessorKey: "hikeName",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 hover:bg-transparent hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Expedition <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-semibold line-clamp-1 max-w-[160px]">{row.getValue("hikeName")}</div>,
    },
    {
      id: "customer",
      accessorFn: row => row.customerName || row.customerEmail || "Unknown",
      header: "Explorer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.customerName || "Guest"}</span>
          {row.original.userId && <button className="text-[10px] uppercase text-primary hover:underline text-left" onClick={() => openUser(row.original.userId)}>History</button>}
        </div>
      ),
    },
    {
      accessorKey: "bookingDate",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Date <ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => {
        const date = row.original.hikeDate;
        return date ? <div className="flex items-center gap-1.5 text-muted-foreground text-sm"><Calendar className="h-3.5 w-3.5" />{format(new Date(date), "MMM do, yyyy")}</div> : "Pending";
      },
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => getStatusBadge(row.getValue("status")) },
    { accessorKey: "totalCost", header: () => <div className="text-right">Revenue</div>, cell: ({ row }) => <div className="text-right font-medium">{toMoney(Number(row.getValue("totalCost") || 0))}</div> },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Actions</div>,
      cell: ({ row }) => {
        const b = row.original;
        const busy = actionLoadingId === b._id;
        return (
          <div className="flex justify-end gap-2 pr-2">
            <Button size="sm" variant="secondary" className="h-8 px-2" onClick={() => openDetails(b)}><Eye className="h-3.5 w-3.5 xl:mr-1.5" /> <span className="hidden xl:inline">Details</span></Button>
            {b.status === "pending" && <Button size="sm" className="h-8 px-2" onClick={() => openConfirmModal(b)} disabled={busy}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 xl:mr-1.5" />}<span className="hidden xl:inline">Confirm</span></Button>}
            {b.status !== "cancelled" ? <Button size="sm" variant="outline" className="h-8 px-2 text-destructive" onClick={() => patchStatus(b._id, "cancelled")} disabled={busy}><XCircle className="h-3.5 w-3.5 xl:mr-1.5" /><span className="hidden xl:inline">Cancel</span></Button>
            : <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => requestDeleteBooking(b._id)} disabled={busy}><Trash2 className="h-3.5 w-3.5 xl:mr-1.5" /><span className="hidden xl:inline">Delete</span></Button>}
          </div>
        );
      },
    },
  ], [actionLoadingId]);

  const table = useReactTable({
    data: useMemo(() => statusFilter === "all" ? bookings : bookings.filter(b => b.status === statusFilter), [bookings, statusFilter]),
    columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), onSortingChange: setSorting, getSortedRowModel: getSortedRowModel(), onColumnFiltersChange: setColumnFilters, getFilteredRowModel: getFilteredRowModel(), onGlobalFilterChange: setGlobalFilter, globalFilterFn: "auto", state: { sorting, columnFilters, globalFilter }, initialState: { pagination: { pageSize: 5 } },
  });

  if (initialLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" /><p>Loading the command center...</p></div>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1400px] mt-14">
      {/* Alert Dialog for Deletions */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently remove the {itemToDelete?.type === "booking" ? "booking record" : "guide profile"} from the TrailSense database.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Booking Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary" /> Confirm Expedition</DialogTitle>
            <DialogDescription>{confirmTarget?.hikeName} • {formatDate(confirmTarget)}</DialogDescription>
          </DialogHeader>
          {confirmTarget && (
            <div className="space-y-6 py-4">
              {confirmTarget.guide === "basic" || confirmTarget.guide === "expert" ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-600 mb-1">Guide Assignment Required</h4>
                      <p className="text-xs text-muted-foreground mb-3">The explorer requested a <strong>{confirmTarget.guide.toUpperCase()}</strong> guide.</p>
                      <Select value={assignedGuide} onValueChange={setAssignedGuide}>
                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Select a guide..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>Select a guide...</SelectItem>
                          {guides.map(g => <SelectItem key={g._id} value={g._id}>{g.name} ({g.experienceLevel || "Basic"})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : <div className="bg-muted/30 p-4 rounded-xl text-sm border">Self-Guided expedition. No guide assignment required.</div>}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button onClick={submitConfirm} disabled={(confirmTarget?.guide !== "none" && assignedGuide === "none") || actionLoadingId === confirmTarget?._id}>{actionLoadingId === confirmTarget?._id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Booking Details</DialogTitle>
            <DialogDescription>{selected ? <>{selected.hikeName} • {formatDate(selected)}</> : "Loading..."}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div><p className="text-xs text-muted-foreground mb-1">Explorer</p><p className="font-medium text-sm">{selected.customerName || "Guest"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Status</p>{getStatusBadge(selected.status)}</div>
                <div><p className="text-xs text-muted-foreground mb-1">Email</p><p className="text-sm truncate">{selected.customerEmail || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Phone</p><p className="text-sm">{selected.customerPhone || "—"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-card border rounded-xl p-3"><Clock className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Time</p><p className="font-semibold text-sm">{selected.hikeTime || "—"}</p></div>
                <div className="bg-card border rounded-xl p-3"><Users className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Size</p><p className="font-semibold text-sm">{selected.numberOfPeople}</p></div>
                <div className="bg-card border rounded-xl p-3"><UserIcon className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Tier</p><p className="font-semibold text-sm">{prettyGuide(selected.guide)}</p></div>
              </div>
              {selected.gearQty && Object.keys(selected.gearQty).length > 0 && (
                <div className="bg-card border rounded-xl p-4">
                  <span className="text-sm font-semibold flex items-center gap-2 mb-3 border-b pb-2"><Backpack className="h-4 w-4" /> Rented Gear</span>
                  <div className="space-y-2">{Object.entries(selected.gearQty).map(([sku, qty]) => <div key={sku} className="flex justify-between items-center text-sm"><span>{sku.replace(/_/g, " ").toLowerCase()}</span><Badge variant="secondary">Qty: {qty}</Badge></div>)}</div>
                </div>
              )}
              <div className="bg-card border rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Transport:</span><span className="font-medium capitalize">{selected.transport || "None"}</span></div>
                {selected.pickupLocation && <div className="flex justify-between text-sm"><span>Pickup:</span><span className="font-medium truncate max-w-[200px]">{selected.pickupLocation}</span></div>}
                <div className="border-t pt-2 mt-2 flex justify-between items-center"><span className="font-medium">Total</span><span className="font-bold text-lg text-primary">{toMoney(Number(selected.totalCost || 0))}</span></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-4">
            {selected && (
              <div className="flex-1 flex gap-2">
                {selected.status === "pending" && <Button size="sm" onClick={() => openConfirmModal(selected)}><CheckCircle className="h-4 w-4 mr-1" /> Confirm</Button>}
                {selected.status !== "cancelled" && <Button size="sm" variant="outline" className="text-destructive" onClick={() => patchStatus(selected._id, "cancelled")}>Cancel</Button>}
                {selected.status === "cancelled" && <Button size="sm" variant="destructive" onClick={() => requestDeleteBooking(selected._id)}>Delete</Button>}
              </div>
            )}
            <Button variant="ghost" onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explorer History Modal */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Explorer History</DialogTitle><DialogDescription>{userHistory ? <>{userHistory.label} • {userHistory.count} bookings • LTV {toMoney(userHistory.revenue)}</> : "—"}</DialogDescription></DialogHeader>
          {userHistory && (
            <div className="max-h-[400px] overflow-auto rounded-xl border mt-4">
              <Table><TableHeader className="bg-muted/50"><TableRow><TableHead>Date</TableHead><TableHead>Destination</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>{userHistory.list.map((b) => <TableRow key={b._id}><TableCell className="text-muted-foreground text-sm">{formatDate(b)}</TableCell><TableCell className="font-medium text-sm">{b.hikeName}</TableCell><TableCell>{getStatusBadge(b.status)}</TableCell><TableCell className="text-right font-medium text-sm">{toMoney(Number(b.totalCost || 0))}</TableCell></TableRow>)}</TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Field Guides Modal */}
      <Dialog open={guidesOpen} onOpenChange={setGuidesOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Manage Field Guides</DialogTitle><DialogDescription>Add or remove guides from the roster.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4 border-r pr-8">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">{guideForm._id ? "Edit Guide" : "Onboard New Guide"}</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveGuide(); }}>
                <div className="space-y-2"><Label className="text-xs">Full Name</Label><Input value={guideForm.name} onChange={e => setGuideForm({ ...guideForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label className="text-xs">Email</Label><Input type="email" value={guideForm.email} onChange={e => setGuideForm({ ...guideForm, email: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label className="text-xs">Tier</Label>
                  <Select value={guideForm.experienceLevel} onValueChange={(val) => setGuideForm({ ...guideForm, experienceLevel: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="basic">Basic (Local)</SelectItem><SelectItem value="expert">Expert (Mountaineer)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label className="text-xs">Password</Label><div className="relative"><Input type={showPassword ? "text" : "password"} value={guideForm.password} onChange={e => setGuideForm({ ...guideForm, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                {guideError && <p className="text-sm text-destructive">{guideError}</p>}
                <div className="flex gap-2 pt-2"><Button type="submit" className="w-full">{guideSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{guideForm._id ? "Update" : "Save"}</Button>{guideForm._id && <Button type="button" variant="outline" onClick={resetGuideForm}>Cancel</Button>}</div>
              </form>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">Active Roster ({guides.length})</h3>
              <div className="max-h-[400px] overflow-y-auto space-y-2 hide-scrollbar">
                {guides.map((g) => (
                  <div key={g._id} className={cn("flex items-center justify-between border p-3 rounded-xl", guideForm._id === g._id ? "bg-primary/5 border-primary" : "bg-muted/10")}>
                    <div className="flex items-start gap-3"><div className="mt-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold bg-muted">{g.experienceLevel === "expert" ? <GraduationCap className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}</div><div><p className="font-semibold text-sm">{g.name}</p><Badge variant="secondary" className="text-[10px] capitalize">{g.experienceLevel || "basic"}</Badge></div></div>
                    <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => setGuideForm({ _id: g._id, name: g.name, email: g.email, password: "", experienceLevel: g.experienceLevel || "basic" })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => requestDeleteGuide(g._id)}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Header */}
      <div className="bg-card border shadow-sm rounded-3xl p-6 md:p-8 mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-2"><Settings className="h-3 w-3 mr-1" /> Command Center</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.fullName.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm max-w-xl">Monitor expeditions, manage inventory, and track revenue.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-full" asChild><Link href="/admin/hikes"><Mountain className="mr-2 h-4 w-4" /> Hikes</Link></Button>
          <Button variant="secondary" className="rounded-full" asChild><Link href="/admin/rentals"><Backpack className="mr-2 h-4 w-4" /> Rentals</Link></Button>
          <Button variant="secondary" className="rounded-full" onClick={() => { setGuidesOpen(true); loadGuides(); }}><UserPlus className="mr-2 h-4 w-4" /> Guides</Button>
          <Button variant="outline" className="rounded-full" onClick={() => fetchDashboardData("refresh")} disabled={refreshing}><RefreshCcw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} /> Refresh</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><BarChart3 className="h-5 w-5" /></div><Badge variant="outline">Volume</Badge></div><p className="text-xs font-medium text-muted-foreground">Total Bookings</p><h4 className="text-3xl font-bold">{analytics.totalBookings}</h4></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl"><Clock className="h-5 w-5" /></div><Badge variant="outline">Alerts</Badge></div><p className="text-xs font-medium text-muted-foreground">Pending Approval</p><h4 className="text-3xl font-bold">{analytics.pendingBookings}</h4></CardContent></Card>
        <Card className="rounded-2xl"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-green-500/10 text-green-600 rounded-xl"><CheckCircle className="h-5 w-5" /></div><Badge variant="outline">Active</Badge></div><p className="text-xs font-medium text-muted-foreground">Confirmed Trips</p><h4 className="text-3xl font-bold">{analytics.confirmedBookings}</h4></CardContent></Card>
        <Card className="rounded-2xl bg-primary text-primary-foreground"><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="p-2.5 bg-white/20 rounded-xl"><TrendingUp className="h-5 w-5" /></div><Badge variant="secondary">Profit</Badge></div><p className="text-xs font-medium text-white/70">Total Revenue</p><h4 className="text-3xl font-bold">{toMoney(analytics.totalRevenue)}</h4></CardContent></Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-sm overflow-hidden rounded-3xl mb-8">
        <CardHeader className="bg-muted/10 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
          <div><CardTitle className="text-xl flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Expedition Log</CardTitle></div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}><SelectTrigger className="w-[150px] rounded-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select>
            <div className="relative w-full sm:w-[280px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search logs..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 rounded-full" /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">{table.getHeaderGroups().map((hg) => <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
            <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={6} className="h-24 text-center">No results.</TableCell></TableRow>}</TableBody>
          </Table>
          <div className="flex items-center justify-end p-4 border-t gap-2"><Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</Button><Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button></div>
        </CardContent>
      </Card>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Trends</CardTitle>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <button onClick={() => setChartTimeframe("7d")} className={cn("text-xs px-3 py-1 rounded-md", chartTimeframe === "7d" ? "bg-background shadow-sm" : "text-muted-foreground")}>7D</button>
              <button onClick={() => setChartTimeframe("30d")} className={cn("text-xs px-3 py-1 rounded-md", chartTimeframe === "30d" ? "bg-background shadow-sm" : "text-muted-foreground")}>30D</button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={displayedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} tickFormatter={(v) => `LKR ${v / 1000}k`} /><Tooltip contentStyle={{ borderRadius: '12px' }} formatter={(v: any) => [toMoney(v), "Revenue"]} /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorRevenue)" /></AreaChart></ResponsiveContainer></CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="rounded-2xl overflow-hidden"><CardHeader className="bg-muted/10 border-b"><CardTitle className="text-sm flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Top Trails</CardTitle></CardHeader><CardContent className="p-0 divide-y">{analytics.topHikes.map((h, i) => <div key={h.name} className="flex items-center justify-between p-4 hover:bg-muted/5"><div className="flex gap-3"><span className="text-xs font-bold text-muted-foreground">{i + 1}.</span><div><div className="font-medium text-sm">{h.name}</div><div className="text-xs text-muted-foreground">{toMoney(h.revenue)}</div></div></div><Badge variant="secondary">{h.count}</Badge></div>)}</CardContent></Card>
          <Card className="rounded-2xl overflow-hidden"><CardHeader className="bg-muted/10 border-b"><CardTitle className="text-sm flex items-center gap-2"><UserIcon className="h-4 w-4 text-blue-500" /> Top Explorers</CardTitle></CardHeader><CardContent className="p-0 divide-y">{analytics.topUsers.map((u, i) => <button key={u.id} onClick={() => openUser(u.id)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 text-left"><div className="flex gap-3"><span className="text-xs font-bold text-muted-foreground">{i + 1}.</span><div><div className="font-medium text-sm truncate max-w-[100px]">{u.label}</div><div className="text-xs text-muted-foreground">{toMoney(u.revenue)}</div></div></div><Badge variant="secondary">{u.count}</Badge></button>)}</CardContent></Card>
        </div>
      </div>
    </div>
  );
}