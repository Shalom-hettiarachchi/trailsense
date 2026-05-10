"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  MapPin,
  Plus,
  Pencil,
  XCircle,
  Save,
  Loader2,
  Mountain,
  Users,
  Map,
  ArrowUpDown,
  Search,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface UserDashboardProps {
  user: MeUser;
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed": return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none">Confirmed</Badge>;
    case "pending": return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 shadow-none">Pending</Badge>;
    case "cancelled": return <Badge variant="outline" className="text-muted-foreground line-through shadow-none">Cancelled</Badge>;
    default: return <Badge variant="secondary" className="shadow-none">{status}</Badge>;
  }
};

export default function UserDashboard({ user }: UserDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Data Table States
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHikeDate, setEditHikeDate] = useState("");
  const [editPeople, setEditPeople] = useState("1");
  const [editGuide, setEditGuide] = useState("none");
  const [editTransport, setEditTransport] = useState("none");
  const [editPickup, setEditPickup] = useState("");
  const [editError, setEditError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Cancel State
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  // Fetch Logic
  const fetchBookings = async (uid: string) => {
    const res = await fetch(`/api/bookings?userId=${uid}`, { cache: "no-store" });
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

  // --- Actions ---
  const startEdit = async (b: Booking) => {
    setEditingId(b._id);
    setEditHikeDate(b.hikeDate ? b.hikeDate.split('T')[0] : "");
    setEditPeople(String(b.numberOfPeople || 1));
    setEditGuide(b.guide || "none");
    setEditTransport(b.transport || "none");
    setEditPickup(b.pickupLocation || "");
    setEditDialogOpen(true);

    const res = await fetch(`/api/bookings?bookingId=${b._id}`, { cache: "no-store" });
    const data = await res.json();
    if (data.booking) {
      const booking = data.booking;
      setEditHikeDate(booking.hikeDate ? booking.hikeDate.split('T')[0] : "");
      setEditPeople(String(booking.numberOfPeople || 1));
      setEditGuide(booking.guide || "none");
      setEditTransport(booking.transport || "none");
      setEditPickup(booking.pickupLocation || "");
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditError("");
    const ppl = Number(editPeople);
    if (!editHikeDate) return setEditError("Please select a hike date");
    if (!ppl || ppl < 1 || ppl > 20) return setEditError("Group size must be between 1-20");

    setActionLoadingId(editingId);
    try {
      await fetch("/api/bookings/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId, hikeDate: editHikeDate, numberOfPeople: ppl,
          guide: editGuide, transport: editTransport, pickupLocation: editPickup,
        }),
      });
      if (!user?.id) return;
      const list = await fetchBookings(user.id);
      setBookings(list);
      setEditDialogOpen(false);
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
    setActionLoadingId(cancelTarget._id);
    try {
      await fetch("/api/bookings/update", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cancelTarget._id, status: "cancelled" }),
      });
      if (!user?.id) return;
      const list = await fetchBookings(user.id);
      setBookings(list);
      setCancelDialogOpen(false);
      setCancelTarget(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // TanStack Table Column Definitions 
  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: "hikeName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4 hover:bg-transparent hover:text-primary"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Destination
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-semibold text-foreground">{row.getValue("hikeName")}</div>
        ),
      },
      {
        accessorKey: "hikeDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="-ml-4 hover:bg-transparent hover:text-primary"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Expedition Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const date = row.getValue("hikeDate") as string;
          if (!date) return <span className="text-muted-foreground italic">Pending</span>;
          return (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
              {format(new Date(date), "MMM do, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "numberOfPeople",
        header: "Group Size",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" /> {row.getValue("numberOfPeople")}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const b = row.original;
          const isCancelled = b.status === "cancelled";
          const busy = actionLoadingId === b._id;

          return (
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 px-3 text-xs bg-secondary/50" 
                onClick={() => startEdit(b)} 
                disabled={busy || isCancelled}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="h-8 px-3 text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-none" 
                onClick={() => requestCancel(b)} 
                disabled={busy || isCancelled}
              >
                {busy && cancelTarget?._id === b._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5 mr-1.5" />} 
                Cancel
              </Button>
            </div>
          );
        },
      },
    ],
    [actionLoadingId, cancelTarget]
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 5 } },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl animate-in fade-in duration-500 mt-14">
      
      {/* Cancellation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Cancel Expedition
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to cancel your trip to <strong className="text-foreground">{cancelTarget?.hikeName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep the Booking</Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={actionLoadingId === cancelTarget?._id}>
              {actionLoadingId === cancelTarget?._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Update Booking</DialogTitle>
            <DialogDescription>Modify your expedition details below.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Hike Date</Label>
              <Input type="date" value={editHikeDate} onChange={(e) => setEditHikeDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Group Size</Label>
              <Input type="number" min="1" max="20" value={editPeople} onChange={(e) => setEditPeople(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Guide Option</Label>
              <Select value={editGuide} onValueChange={setEditGuide}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Guide</SelectItem>
                  <SelectItem value="basic">Local Guide</SelectItem>
                  <SelectItem value="expert">Expert Mountaineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transport Option</Label>
              <Select value={editTransport} onValueChange={setEditTransport}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Self Transport</SelectItem>
                  <SelectItem value="car">Standard Sedan</SelectItem>
                  <SelectItem value="van">Expedition Van</SelectItem>
                  <SelectItem value="jeep">4WD Jeep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editTransport !== "none" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Pickup Location</Label>
                <Input placeholder="Enter hotel or city name" value={editPickup} onChange={(e) => setEditPickup(e.target.value)} />
              </div>
            )}
          </div>
          
          {editError && <p className="text-sm text-destructive font-medium">{editError}</p>}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={actionLoadingId === editingId}>
              {actionLoadingId === editingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Unified Welcome & Stats Banner --- */}
      <div className="mb-10 bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden relative">
        {/* Subtle Background Icon */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden lg:block">
          <Mountain className="w-64 h-64 -mt-12 -mr-12" />
        </div>
        
        <div className="p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          
          {/* Welcome Text */}
          <div className="space-y-2">
            <Badge variant="outline" className="bg-background/50 mb-2">
              <Compass className="h-3.5 w-3.5 mr-1.5 text-primary" /> Explorer Dashboard
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome back, {profile?.fullName?.split(" ")[0] || "Explorer"}!
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Here is an overview of your expeditions. Prepare for your next journey or review past adventures.
            </p>
            <div className="pt-4">
              <Button className="rounded-full shadow-sm" asChild>
                <Link href="/planner"><Plus className="mr-2 h-4 w-4" /> Book New Hike</Link>
              </Button>
            </div>
          </div>

          {/* Grouped Stats Cards */}
          <div className="flex gap-4 sm:gap-6 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-none w-full sm:w-48 shrink-0 rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="p-2.5 w-fit bg-primary/10 text-primary rounded-xl">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-3xl font-extrabold text-foreground">{bookings.length}</h4>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-none w-full sm:w-48 shrink-0 rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="p-2.5 w-fit bg-green-500/10 text-green-600 rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-3xl font-extrabold text-foreground">{upcomingCount}</h4>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Hikes</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* FULL SHADCN DATA TABLE */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-muted/10 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Mountain className="h-5 w-5 text-primary" /> Expedition Ledger
            </CardTitle>
            <CardDescription className="mt-1">View, manage, and filter your booked trips.</CardDescription>
          </div>
          
          {/* Data Table Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations..."
              value={(table.getColumn("hikeName")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("hikeName")?.setFilterValue(event.target.value)}
              className="pl-9 h-10 bg-background rounded-full"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="py-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn("h-16 group transition-colors", row.original.status === "cancelled" && "bg-muted/20 opacity-70")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mb-3 opacity-20" />
                        <p>No expeditions found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Data Table Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t bg-muted/10">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {bookings.length} trips.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}