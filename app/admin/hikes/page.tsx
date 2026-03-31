"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Mountain,
  Search,
  MapPin,
  Clock,
  Route,
  Activity,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HikeDTO = {
  _id: string;
  slug: string;
  name: string;
  location?: string;
  difficulty: string;
  duration?: string;
  distance?: string;
  bestSeason?: string;
  description?: string;
  fullDescription?: string;
  imageUrl?: string;
  permitRequired?: boolean;
  safetyTips?: string[];
  highlights?: string[];
  mapEmbedUrl?: string;
  baseFee?: number;
  dropLat?: number;
  dropLng?: number;
  isActive?: boolean;
  sortOrder?: number;
};

function toMoney(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

const emptyForm = (): Partial<HikeDTO> => ({
  _id: "",
  slug: "",
  name: "",
  location: "",
  difficulty: "Moderate",
  duration: "",
  distance: "",
  bestSeason: "",
  description: "",
  fullDescription: "",
  imageUrl: "",
  permitRequired: false,
  safetyTips: [],
  highlights: [],
  mapEmbedUrl: "",
  baseFee: 0,
  dropLat: 0,
  dropLng: 0,
  isActive: true,
  sortOrder: 0,
});

export default function AdminHikesPage() {
  const [items, setItems] = useState<HikeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Dialogs
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<HikeDTO | null>(null);
  const [form, setForm] = useState<Partial<HikeDTO>>(emptyForm());

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/hikes", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load");
      setItems(Array.isArray(data?.hikes) ? data.hikes : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((h) => 
      [h.slug, h.name, h.location, h.difficulty].some(v => v?.toLowerCase().includes(query))
    );
  }, [items, q]);

  function openCreate() {
    setMode("create");
    setForm(emptyForm());
    setOpenEdit(true);
  }

  function openEditDialog(h: HikeDTO) {
    setMode("edit");
    setForm({
      ...h,
      safetyTips: Array.isArray(h.safetyTips) ? h.safetyTips : [],
      highlights: Array.isArray(h.highlights) ? h.highlights : [],
    });
    setOpenEdit(true);
  }

  async function save() {
    const payload = {
      ...form,
      baseFee: Number(form.baseFee || 0),
      safetyTips: typeof form.safetyTips === "string" ? (form.safetyTips as string).split("\n").filter(Boolean) : form.safetyTips,
      highlights: typeof form.highlights === "string" ? (form.highlights as string).split("\n").filter(Boolean) : form.highlights,
    };

    if (!payload.slug || !payload.name) return toast.error("Slug and Name are required");

    setBusyId("saving");
    try {
      const url = mode === "create" ? "/api/hikes" : `/api/hikes/${form._id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(mode === "create" ? "Hike created" : "Hike updated");
      fetchAll();
      setOpenEdit(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(h: HikeDTO) {
    setBusyId(h._id);
    try {
      const res = await fetch(`/api/hikes/${h._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !h.isActive }),
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(x => x._id === h._id ? { ...x, isActive: !h.isActive } : x));
      toast.success(h.isActive ? "Hike disabled" : "Hike activated");
    } catch {
      toast.error("Failed to toggle status");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!selected) return;
    setBusyId(selected._id);
    try {
      const res = await fetch(`/api/hikes/${selected._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(x => x._id !== selected._id));
      toast.success("Hike deleted permanently");
      setOpenDelete(false);
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p>Syncing trail data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-card border border-border/50 shadow-sm rounded-3xl p-6 md:p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-medium mb-1">
            <Mountain className="h-5 w-5" />
            <span className="text-sm uppercase tracking-wider">Inventory Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Expedition Catalog</h1>
          <p className="text-muted-foreground text-sm">Create and maintain the trail roster for TrailSense explorers.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Desk</Link>
          </Button>
          <Button className="rounded-full shadow-lg shadow-primary/20" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Trail
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by trail name, slug, difficulty or region..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-11 h-12 bg-card rounded-2xl border-border/50 shadow-sm md:max-w-xl"
        />
      </div>

      {/* Main Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30 h-14">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[100px]">Preview</TableHead>
                <TableHead>Trail Info</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Base Fee</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h) => (
                <TableRow key={h._id} className="group h-20">
                  <TableCell className="pl-6">
                    <div className="h-12 w-16 rounded-xl bg-muted overflow-hidden border border-border/50 shadow-inner">
                      {h.imageUrl ? (
                        <img src={h.imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      ) : <Mountain className="h-full w-full p-3 opacity-20" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{h.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">{h.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "shadow-none",
                      h.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-600",
                      h.difficulty === "Hard" && "bg-orange-500/10 text-orange-600",
                      h.difficulty === "Expert" && "bg-red-500/10 text-red-600"
                    )}>
                      {h.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {toMoney(h.baseFee || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={h.isActive} 
                        onCheckedChange={() => toggleActive(h)}
                        disabled={busyId === h._id}
                      />
                      <span className={cn("text-xs font-medium", h.isActive ? "text-emerald-600" : "text-muted-foreground")}>
                        {h.isActive ? "Public" : "Draft"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setSelected(h); setOpenView(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(h)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setSelected(h); setOpenDelete(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center text-muted-foreground">
              <Mountain className="h-12 w-12 mb-4 opacity-10" />
              <p>No trails found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals Section */}

      {/* Delete Alert */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retire this trail?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">{selected?.name}</strong>? This will remove all associated metadata from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 rounded-3xl">
          <div className="h-48 w-full bg-muted relative">
            {selected?.imageUrl ? (
              <img src={selected.imageUrl} className="w-full h-full object-cover" alt="" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-2xl font-bold">{selected?.name}</h2>
              <p className="text-white/80 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected?.location}</p>
            </div>
          </div>
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-primary" /> <strong>Difficulty:</strong> {selected?.difficulty}</div>
              <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary" /> <strong>Duration:</strong> {selected?.duration}</div>
              <div className="flex items-center gap-2 text-sm"><Route className="h-4 w-4 text-primary" /> <strong>Distance:</strong> {selected?.distance}</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Overview</h4>
              <p className="text-sm leading-relaxed text-foreground/80">{selected?.fullDescription || selected?.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!!selected?.highlights?.length && (
                <div className="bg-muted/30 p-4 rounded-2xl border">
                  <h4 className="font-semibold text-sm mb-2">Highlights</h4>
                  <ul className="text-xs space-y-1.5 text-muted-foreground">
                    {selected.highlights.map((h, i) => <li key={i} className="flex gap-2">• {h}</li>)}
                  </ul>
                </div>
              )}
              {!!selected?.safetyTips?.length && (
                <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10">
                  <h4 className="font-semibold text-sm mb-2 text-orange-700">Safety Tips</h4>
                  <ul className="text-xs space-y-1.5 text-orange-800/70">
                    {selected.safetyTips.map((t, i) => <li key={i} className="flex gap-2">⚠️ {t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl">{mode === "create" ? "Add New Trail" : "Modify Trail Data"}</DialogTitle>
            <DialogDescription>Sync the latest trail intelligence to the platform.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Trail Name</Label>
              <Input placeholder="e.g. Pidurangala Rock" value={form.name || ""} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Slug (URL)</Label>
              <Input placeholder="pidurangala-rock" value={form.slug || ""} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm(p => ({ ...p, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Location</Label>
              <Input value={form.location || ""} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Base Fee (LKR)</Label>
              <Input type="number" value={form.baseFee || ""} onChange={(e) => setForm(p => ({ ...p, baseFee: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Distance (km)</Label>
              <Input value={form.distance || ""} onChange={(e) => setForm(p => ({ ...p, distance: e.target.value }))} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
              <textarea className="w-full min-h-[100px] rounded-xl border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={form.fullDescription || ""} onChange={(e) => setForm(p => ({ ...p, fullDescription: e.target.value }))} />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Highlights (one per line)</Label>
                <textarea className="w-full h-32 rounded-xl border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                  value={Array.isArray(form.highlights) ? form.highlights.join("\n") : ""} 
                  onChange={(e) => setForm(p => ({ ...p, highlights: e.target.value.split("\n") }))} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Safety Tips (one per line)</Label>
                <textarea className="w-full h-32 rounded-xl border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium text-orange-700" 
                  value={Array.isArray(form.safetyTips) ? form.safetyTips.join("\n") : ""} 
                  onChange={(e) => setForm(p => ({ ...p, safetyTips: e.target.value.split("\n") }))} 
                />
              </div>
            </div>
            <div className="flex items-center gap-6 md:col-span-3 bg-muted/30 p-4 rounded-2xl border border-dashed">
              <div className="flex items-center gap-2">
                <Switch checked={form.permitRequired} onCheckedChange={(v) => setForm(p => ({ ...p, permitRequired: v }))} />
                <Label className="text-sm">Permit Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
                <Label className="text-sm">Public Visibility</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-6 gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setOpenEdit(false)}>Discard</Button>
            <Button className="rounded-full px-8" onClick={save} disabled={busyId === "saving"}>
              {busyId === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sync to Catalog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}