"use client";

import { useEffect, useMemo, useState } from "react";
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
  useReactTable,
} from "@tanstack/react-table";

// User type from your auth/dashboard system
import { MeUser } from "@/app/dashboard/page";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Calendar,
  MapPin,
  Eye,
  Loader2,
  Users,
  Clock,
  Phone,
  Mail,
  Backpack,
  Compass,
  ArrowUpDown,
  Search,
  Wallet,
  Map,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppUser = MeUser;

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
  assignedGuideId?: string; // The field linked to the guide's user.id
  transport?: string;
  pickupLocation?: string;
  gearQty?: Record<string, number>;
  guideCost?: number; 
};

interface GuideDashboardProps {
  user: AppUser | null;
}

function toMoney(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

export default function GuideDashboard({ user }: GuideDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  // Table State
  const [sorting, setSorting] = useState<SortingState>([{ id: "hikeDate", desc: false }]); // Sort upcoming first
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch bookings
        const res = await fetch("/api/bookings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || `Request failed`);

        const list: Booking[] = Array.isArray(data?.bookings) ? data.bookings : [];

        // STRICT FILTER: Only confirmed bookings specifically assigned to THIS guide
        const assignedToMe = list.filter(
          (b) => b.assignedGuideId === user.id && b.status === "confirmed"
        );

        if (!alive) return;
        setBookings(assignedToMe);
      } catch (err) {
        console.error(err);
        if (alive) setBookings([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [user?.id]);

  const formatDate = (d?: string) => {
    if (!d) return "—";
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return "—";
    return format(x, "MMM do, yyyy");
  };

  const prettyGuide = (g?: string) => {
    if (!g || g === "none") return "None";
    if (g === "basic") return "Basic (Local)";
    if (g === "expert") return "Expert (Mountaineer)";
    return g;
  };

  // --- Analytics ---
  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter((b) => {
      if (!b.hikeDate) return false;
      const d = new Date(b.hikeDate);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    }).length;
  }, [bookings]);

  const totalGuideRevenue = useMemo(() => {
    // If guideCost isn't populated yet by the backend, fallback to a base calculation
    return bookings.reduce((sum, b) => {
      const fallbackCost = b.guide === "expert" ? 6000 : 3000;
      return sum + Number(b.guideCost || fallbackCost);
    }, 0);
  }, [bookings]);

  // --- Table Columns ---
  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: "hikeName",
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-4 hover:bg-transparent hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Destination <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-semibold text-foreground line-clamp-1 max-w-[180px]">{row.getValue("hikeName")}</div>
        ),
      },
      {
        accessorKey: "hikeDate",
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-4 hover:bg-transparent hover:text-primary" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Expedition Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue("hikeDate") as string;
          if (!date) return "—";
          return (
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              {format(new Date(date), "MMM do, yyyy")}
            </div>
          );
        },
      },
      {
        id: "customer",
        accessorFn: row => row.customerName || row.customerEmail || "Guest",
        header: "Explorer",
        cell: ({ row }) => (
          <span className="font-medium line-clamp-1 max-w-[150px]">{row.getValue("customer")}</span>
        ),
      },
      {
        accessorKey: "numberOfPeople",
        header: "Group",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" /> {row.getValue("numberOfPeople")}
          </div>
        ),
      },
      {
        id: "earnings",
        header: () => <div className="text-right">Your Fee</div>,
        cell: ({ row }) => {
          const b = row.original;
          const fallbackCost = b.guide === "expert" ? 6000 : 3000;
          return <div className="text-right font-medium text-green-600">{toMoney(Number(b.guideCost || fallbackCost))}</div>;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-4">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-end pr-2">
            <Button size="sm" variant="secondary" className="h-8 px-3 text-xs bg-secondary/50" onClick={() => { setSelected(row.original); setDetailsOpen(true); }}>
              <Eye className="h-3.5 w-3.5 md:mr-1.5" /> <span className="hidden md:inline">View Trip</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "auto",
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 8 } },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Loading your expeditions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-[1400px] animate-in fade-in duration-500 mt-14">

      {/* =========================================
          READ-ONLY DETAILS MODAL
      ========================================= */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" /> Expedition Brief
            </DialogTitle>
            <DialogDescription>
              {selected ? (
                <>{selected.hikeName} • {formatDate(selected.hikeDate)}</>
              ) : (
                "Loading details..."
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1 hide-scrollbar">
              
              {/* Explorer Contact Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Lead Explorer</p>
                  <p className="font-medium text-base">{selected.customerName || selected.customerEmail || "Guest"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                  <p className="text-sm font-medium">{selected.customerPhone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="text-sm truncate" title={selected.customerEmail}>{selected.customerEmail || "Not provided"}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-xl p-3 text-center">
                  <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Start Time</p>
                  <p className="font-semibold text-sm">{selected.hikeTime || "TBD"}</p>
                </div>
                <div className="bg-card border rounded-xl p-3 text-center">
                  <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Group Size</p>
                  <p className="font-semibold text-sm">{selected.numberOfPeople} Hikers</p>
                </div>
              </div>

              {/* Rented Gear Display */}
              {selected.gearQty && Object.keys(selected.gearQty).length > 0 && (
                <div className="bg-card border rounded-xl p-4">
                  <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3 border-b pb-2">
                    <Backpack className="h-4 w-4" /> Explorer is renting gear
                  </span>
                  <div className="space-y-2">
                    {Object.entries(selected.gearQty).map(([sku, qty]) => (
                      <div key={sku} className="flex justify-between items-center text-sm">
                        <span className="capitalize text-foreground font-medium">{sku.replace(/_/g, " ").toLowerCase()}</span>
                        <Badge variant="secondary" className="px-2 shadow-none">Qty: {qty}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logistics & Earnings */}
              <div className="bg-card border rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transport Status:</span>
                  <span className="font-medium capitalize">{selected.transport || "Self-Transport"}</span>
                </div>
                {selected.transport && selected.transport !== "none" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pickup Location:</span>
                    <span className="font-medium text-right max-w-[200px]">{selected.pickupLocation || "—"}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Your Guaranteed Fee</span>
                  <span className="font-bold text-lg text-green-600">
                    {toMoney(Number(selected.guideCost || (selected.guide === "expert" ? 6000 : 3000)))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button className="w-full sm:w-auto" onClick={() => setDetailsOpen(false)}>Acknowledge & Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================
          MAIN PAGE CONTENT
      ========================================= */}

      {/* Unified Welcome Banner */}
      <div className="mb-10 bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none hidden lg:block">
          <Compass className="w-64 h-64 -mt-12 -mr-12" />
        </div>
        
        <div className="p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <Badge variant="outline" className="bg-background/50 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" /> Field Agent Portal
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Hello, {user?.fullName?.split(" ")[0] || "Guide"}!
            </h1>
            <p className="text-muted-foreground text-base max-w-lg">
              Here are all the expeditions you have been assigned to. Review your upcoming schedules and prepare for the trails.
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-none w-full sm:w-48 shrink-0 rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="p-2.5 w-fit bg-primary/10 text-primary rounded-xl">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-3xl font-extrabold text-foreground">{bookings.length}</h4>
                  <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur-sm border-border/50 shadow-none w-full sm:w-48 shrink-0 rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="p-2.5 w-fit bg-green-500/10 text-green-600 rounded-xl">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-foreground">{toMoney(totalGuideRevenue)}</h4>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bookings Data Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl mb-8">
        <CardHeader className="bg-muted/10 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Your Schedule
            </CardTitle>
            <CardDescription className="mt-1">All confirmed trips you are assigned to lead.</CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations or clients..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
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
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="h-[60px] hover:bg-muted/10 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2">
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
                        <p>No upcoming assignments yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t bg-muted/10">
            <div className="flex-1 text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} assignments.
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}