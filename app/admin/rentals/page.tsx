"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Backpack,
  Search,
  Package,
  Boxes,
  ChevronLeft,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RentalDTO = {
  _id: string;
  sku: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  unitPrice: number;
  stock?: number;
  isActive?: boolean;
  sortOrder?: number;
};

const emptyForm = (): Partial<RentalDTO> => ({
  sku: "",
  name: "",
  category: "General",
  description: "",
  imageUrl: "",
  unitPrice: 0,
  stock: 0,
  isActive: true,
  sortOrder: 0,
});

function toMoney(n: number) {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

export default function AdminRentalsPage() {
  const [items, setItems] = useState<RentalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // New: for Cloudinary status
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<RentalDTO | null>(null);
  const [form, setForm] = useState<Partial<RentalDTO>>(emptyForm());

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/rentals", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load");
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((r) =>
      [r.sku, r.name, r.category].some((v) => v?.toLowerCase().includes(query))
    );
  }, [items, q]);

  // Handle Image Upload to Cloudinary
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Size check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File is too large. Max 5MB allowed.");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image processed and ready");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setMode("create");
    setForm(emptyForm());
    setOpenEdit(true);
  }

  function openEditDialog(r: RentalDTO) {
    setMode("edit");
    setForm({ ...r });
    setOpenEdit(true);
  }

  async function save() {
    if (!form.sku || !form.name) return toast.error("SKU and Name are required");

    setBusyId("saving");
    try {
      const isEdit = mode === "edit";
      const url = isEdit ? `/api/rentals/${form._id}` : "/api/rentals";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");
      toast.success(isEdit ? "Inventory updated" : "Equipment added to catalog");
      fetchAll();
      setOpenEdit(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(r: RentalDTO) {
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/rentals/${r._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((x) => (x._id === r._id ? { ...x, isActive: !r.isActive } : x))
      );
      toast.success(r.isActive ? "Item deactivated" : "Item activated");
    } catch {
      toast.error("Status update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!selected) return;
    setBusyId(selected._id);
    try {
      const res = await fetch(`/api/rentals/${selected._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((x) => x._id !== selected._id));
      toast.success("Equipment removed permanently");
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
        <p>Opening equipment locker...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-card border border-border/50 shadow-sm rounded-3xl p-6 md:p-8 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-medium mb-1">
            <Backpack className="h-5 w-5" />
            <span className="text-sm uppercase tracking-wider">Logistics & Gear</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Rental Inventory</h1>
          <p className="text-muted-foreground text-sm">Manage hardware and camping equipment available for expeditions.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/dashboard"><ChevronLeft className="mr-2 h-4 w-4" /> Desk</Link>
            </Button>
            <Button className="rounded-full shadow-lg shadow-primary/20" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Gear
            </Button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU, Name or Category..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-11 h-12 bg-card rounded-2xl border-border/50 shadow-sm"
          />
        </div>
      </div>

      {/* Main Inventory Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30 h-14">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-[100px]">Asset</TableHead>
                <TableHead>Equipment Detail</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r._id} className="group h-20">
                  <TableCell className="pl-6">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border/50 flex items-center justify-center">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : <Package className="h-5 w-5 opacity-20" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{r.name}</span>
                      <span className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">{r.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-500/5 text-blue-600 border-blue-500/10 shadow-none capitalize">
                      {r.category || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {toMoney(r.unitPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                        <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{r.stock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                        checked={r.isActive} 
                        onCheckedChange={() => toggleActive(r)}
                        disabled={busyId === r._id}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => openEditDialog(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => { setSelected(r); setOpenDelete(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center text-muted-foreground">
              <Boxes className="h-12 w-12 mb-4 opacity-10" />
              <p>No equipment found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Dialogs --- */}

      {/* Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Wipe asset from database?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">{selected?.name}</strong>? All associated rental history and SKU records will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Discard</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full">
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit/Create Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-3xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{mode === "create" ? "Onboard Equipment" : "Modify Asset Details"}</DialogTitle>
            <DialogDescription>Update the master catalog with the latest gear specs.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">SKU / Code</Label>
              <Input placeholder="GEAR-TENT-4P" value={form.sku || ""} onChange={(e) => setForm(p => ({ ...p, sku: e.target.value.toUpperCase() }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Camping">Camping Gear</SelectItem>
                  <SelectItem value="Climbing">Climbing Hardware</SelectItem>
                  <SelectItem value="Clothing">Hiking Apparel</SelectItem>
                  <SelectItem value="General">General Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Item Name</Label>
              <Input placeholder="Expedition 4-Person Tent" value={form.name || ""} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            
            {/* --- Image Upload Section --- */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Equipment Image</Label>
              
              {form.imageUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-border bg-muted aspect-video md:aspect-[21/9]">
                  <img 
                    src={form.imageUrl} 
                    alt="Equipment Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="rounded-full"
                      onClick={() => setForm(p => ({ ...p, imageUrl: "" }))}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Replace Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label className={cn(
                  "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                  uploading ? "bg-muted/50 border-primary/20" : "bg-muted/10 border-border hover:bg-muted/30 hover:border-primary/40"
                )}>
                  <div className="flex flex-col items-center justify-center py-5">
                    {uploading ? (
                      <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                        <p className="text-sm font-medium">Syncing with Cloudinary...</p>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Click to upload gear image</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={uploading} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Unit Price (LKR)</Label>
              <Input type="number" value={form.unitPrice || ""} onChange={(e) => setForm(p => ({ ...p, unitPrice: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Stock Level</Label>
              <Input type="number" value={form.stock || ""} onChange={(e) => setForm(p => ({ ...p, stock: Number(e.target.value) }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
              <textarea className="w-full min-h-[100px] rounded-xl border bg-background p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                value={form.description || ""} 
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} 
              />
            </div>
            <div className="flex items-center gap-2 bg-muted/30 p-4 rounded-2xl border border-dashed md:col-span-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm(p => ({ ...p, isActive: v }))} />
                <Label className="text-sm">Available for public rentals</Label>
            </div>
          </div>

          <DialogFooter className="border-t pt-6 gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setOpenEdit(false)}>Discard</Button>
            <Button className="rounded-full px-8" onClick={save} disabled={busyId === "saving" || uploading}>
              {busyId === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}