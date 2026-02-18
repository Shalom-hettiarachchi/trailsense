"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

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
  _id: "",
  sku: "",
  name: "",
  category: "General",
  description: "",
  imageUrl: "",
  unitPrice: 0,
  stock: 9999,
  isActive: true,
  sortOrder: 0,
});

export default function AdminRentalsPage() {
  const [items, setItems] = useState<RentalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<RentalDTO | null>(null);
  const [form, setForm] = useState<Partial<RentalDTO>>(emptyForm());

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rentals", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load rentals");
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || "Failed to load rentals");
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
    return items.filter((r) => {
      const hay = [r.sku, r.name, r.category].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [items, q]);

  function openCreate() {
    setError("");
    setMode("create");
    setSelected(null);
    setForm(emptyForm());
    setOpenEdit(true);
  }

  function openEditDialog(r: RentalDTO) {
    setError("");
    setMode("edit");
    setSelected(r);
    setForm({ ...r, _id: r._id }); // ✅ keep id
    setOpenEdit(true);
  }

  async function save() {
    setError("");

    const payload: any = {
      sku: String(form.sku || "").trim(),
      name: String(form.name || "").trim(),
      category: String(form.category || "General"),
      description: String(form.description || ""),
      imageUrl: String(form.imageUrl || "").trim(),
      unitPrice: Number(form.unitPrice || 0),
      stock: Number(form.stock ?? 9999),
      isActive: Boolean(form.isActive),
      sortOrder: Number(form.sortOrder || 0),
    };

    if (!payload.sku) return setError("SKU is required");
    if (!payload.name) return setError("Name is required");

    setBusyId(mode === "edit" ? String(form._id || "busy") : "busy");
    try {
      if (mode === "create") {
        const res = await fetch("/api/rentals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Create failed");
      } else {
        const id = String(form?._id || selected?._id || "").trim();
        if (!id) throw new Error("Missing rental id. Close and try again.");

        const res = await fetch(`/api/rentals/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Update failed");
      }

      await fetchAll();
      setOpenEdit(false);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(r: RentalDTO) {
    setError("");
    setBusyId(r._id);

    try {
      const res = await fetch(`/api/rentals/${r._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Toggle failed");

      setItems((prev) =>
        prev.map((x) => (x._id === r._id ? { ...x, isActive: !r.isActive } : x))
      );
    } catch (e: any) {
      setError(e?.message || "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(r: RentalDTO) {
    if (!confirm(`Delete rental "${r.name}"? This cannot be undone.`)) return;

    setError("");
    setBusyId(r._id);

    try {
      const res = await fetch(`/api/rentals/${r._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setItems((prev) => prev.filter((x) => x._id !== r._id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading rentals…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Rental Item" : "Edit Rental Item"}
            </DialogTitle>
            <DialogDescription>Example imageUrl: /rentals/rental-tent.jpg</DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>SKU (required)</Label>
              <Input
                value={form.sku || ""}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
              />
            </div>

            <div>
              <Label>Name (required)</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Input
                value={form.category || ""}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              />
            </div>

            <div>
              <Label>Unit Price (LKR)</Label>
              <Input
                type="number"
                value={String(form.unitPrice ?? 0)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, unitPrice: Number(e.target.value) }))
                }
              />
            </div>

            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={String(form.stock ?? 9999)}
                onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={String(form.sortOrder ?? 0)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Image URL</Label>
              <Input
                placeholder="/rentals/rental-tent.jpg"
                value={form.imageUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              />

              {form.imageUrl ? (
                <div className="mt-2 rounded-lg border bg-muted overflow-hidden">
                  <img
                    src={String(form.imageUrl)}
                    alt="preview"
                    className="w-full max-h-[220px] object-contain p-3"
                  />
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background p-2 text-sm"
                value={form.description || ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <span className="text-sm">Active</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!!busyId}>
              {busyId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Manage Rentals</h1>
          <p className="text-muted-foreground">Create, edit, activate/deactivate rental items.</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Rental
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          placeholder="Search rentals (sku, name, category)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:max-w-md"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Rental Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => {
                const busy = busyId === r._id;
                return (
                  <TableRow key={r._id}>
                    <TableCell>
                      <div className="h-12 w-20 rounded-md bg-muted overflow-hidden border">
                        {r.imageUrl ? (
                          <img
                            src={r.imageUrl}
                            alt={r.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">{r.sku}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      Rs. {Math.round(r.unitPrice || 0).toLocaleString("en-LK")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? "default" : "outline"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(r)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(r)}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : r.isActive ? (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          )}
                          {r.isActive ? "Disable" : "Enable"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(r)}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No rental items found.
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
