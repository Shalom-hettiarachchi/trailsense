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
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type HikeDTO = {
  _id: string;
  slug: string;
  name: string;
  location?: string;
  difficulty: "Easy" | "Moderate" | "Hard" | "Expert" | string;
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
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  // dialogs
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<HikeDTO | null>(null);
  const [form, setForm] = useState<Partial<HikeDTO>>(emptyForm());

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hikes", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load hikes");
      setItems(Array.isArray(data?.hikes) ? data.hikes : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || "Failed to load hikes");
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
    return items.filter((h) => {
      const hay = [h.slug, h.name, h.location, h.difficulty]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
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

  function openEditDialog(h: HikeDTO) {
    setError("");
    setMode("edit");
    setSelected(h);
    setForm({
      ...h,
      _id: h._id, // ✅ keep id
      safetyTips: Array.isArray(h.safetyTips) ? h.safetyTips : [],
      highlights: Array.isArray(h.highlights) ? h.highlights : [],
    });
    setOpenEdit(true);
  }

  function openViewDialog(h: HikeDTO) {
    setSelected(h);
    setOpenView(true);
  }

  async function save() {
    setError("");

    const payload: any = {
      ...form,
      slug: String(form.slug || "").trim(),
      name: String(form.name || "").trim(),
      location: String(form.location || "").trim(),
      imageUrl: String(form.imageUrl || "").trim(),
      mapEmbedUrl: String(form.mapEmbedUrl || "").trim(),
      description: String(form.description || ""),
      fullDescription: String(form.fullDescription || ""),
      difficulty: String(form.difficulty || "Moderate"),
      duration: String(form.duration || ""),
      distance: String(form.distance || ""),
      bestSeason: String(form.bestSeason || ""),
      baseFee: Number(form.baseFee || 0),
      dropLat: Number(form.dropLat || 0),
      dropLng: Number(form.dropLng || 0),
      sortOrder: Number(form.sortOrder || 0),
      permitRequired: Boolean(form.permitRequired),
      isActive: Boolean(form.isActive),
      safetyTips:
        typeof form.safetyTips === "string"
          ? String(form.safetyTips)
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(form.safetyTips)
          ? form.safetyTips
          : [],
      highlights:
        typeof form.highlights === "string"
          ? String(form.highlights)
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(form.highlights)
          ? form.highlights
          : [],
    };

    if (!payload.slug) return setError("Slug is required");
    if (!payload.name) return setError("Name is required");

    setBusyId(mode === "edit" ? String(form._id || "busy") : "busy");
    try {
      if (mode === "create") {
        const res = await fetch("/api/hikes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Create failed");
      } else {
        const id = String(form?._id || selected?._id || "").trim();
        if (!id) throw new Error("Missing hike id. Close and try again.");

        const res = await fetch(`/api/hikes/${encodeURIComponent(id)}`, {
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

  async function toggleActive(h: HikeDTO) {
    setError("");
    setBusyId(h._id);
    try {
      const res = await fetch(`/api/hikes/${h._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !h.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Toggle failed");

      setItems((prev) =>
        prev.map((x) => (x._id === h._id ? { ...x, isActive: !h.isActive } : x))
      );
    } catch (e: any) {
      setError(e?.message || "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(h: HikeDTO) {
    if (!confirm(`Delete hike "${h.name}"? This cannot be undone.`)) return;

    setError("");
    setBusyId(h._id);
    try {
      const res = await fetch(`/api/hikes/${h._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      setItems((prev) => prev.filter((x) => x._id !== h._id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading hikes…
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* View dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.name || "Hike"}</DialogTitle>
            <DialogDescription>{selected?.location || "—"}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {selected.imageUrl ? (
                <div className="rounded-lg border overflow-hidden bg-muted">
                  <img
                    src={selected.imageUrl}
                    alt={selected.name}
                    className="w-full max-h-[260px] object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selected.slug}</Badge>
                <Badge variant="secondary">{selected.difficulty}</Badge>
                <Badge variant="secondary">{selected.duration || "—"}</Badge>
                <Badge variant="secondary">
                  Rs. {Math.round(selected.baseFee || 0).toLocaleString("en-LK")}
                </Badge>
                <Badge variant={selected.isActive ? "default" : "outline"}>
                  {selected.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selected.fullDescription || selected.description || "—"}
              </div>

              {!!selected.safetyTips?.length && (
                <div>
                  <p className="font-semibold mb-1">Safety tips</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">
                    {selected.safetyTips.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!!selected.highlights?.length && (
                <div>
                  <p className="font-semibold mb-1">Highlights</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">
                    {selected.highlights.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Hike" : "Edit Hike"}</DialogTitle>
            <DialogDescription>Fields marked required must be filled.</DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Slug (required)</Label>
              <Input
                value={form.slug || ""}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Example: yahangala</p>
            </div>

            <div>
              <Label>Name (required)</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={form.location || ""}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              />
            </div>

            <div>
              <Label>Difficulty</Label>
              <Input
                value={String(form.difficulty || "")}
                onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Easy / Moderate / Hard / Expert
              </p>
            </div>

            <div>
              <Label>Duration</Label>
              <Input
                value={form.duration || ""}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>

            <div>
              <Label>Distance</Label>
              <Input
                value={form.distance || ""}
                onChange={(e) => setForm((p) => ({ ...p, distance: e.target.value }))}
              />
            </div>

            <div>
              <Label>Base Fee (LKR)</Label>
              <Input
                type="number"
                value={String(form.baseFee ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, baseFee: Number(e.target.value) }))}
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

            <div>
              <Label>Image URL</Label>
              <Input
                placeholder="/hikes/yahangala.jpg"
                value={form.imageUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              />
            </div>

            <div>
              <Label>Map Embed URL</Label>
              <Input
                value={form.mapEmbedUrl || ""}
                onChange={(e) => setForm((p) => ({ ...p, mapEmbedUrl: e.target.value }))}
              />
            </div>

            <div>
              <Label>Drop Lat</Label>
              <Input
                type="number"
                value={String(form.dropLat ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, dropLat: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label>Drop Lng</Label>
              <Input
                type="number"
                value={String(form.dropLng ?? 0)}
                onChange={(e) => setForm((p) => ({ ...p, dropLng: Number(e.target.value) }))}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Short Description</Label>
              <Input
                value={form.description || ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Full Description</Label>
              <textarea
                className="w-full min-h-[120px] rounded-md border bg-background p-2 text-sm"
                value={form.fullDescription || ""}
                onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Safety Tips (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border bg-background p-2 text-sm"
                  value={
                    Array.isArray(form.safetyTips)
                      ? form.safetyTips.join("\n")
                      : (form.safetyTips as any) || ""
                  }
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      safetyTips: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>

              <div>
                <Label>Highlights (one per line)</Label>
                <textarea
                  className="w-full min-h-[120px] rounded-md border bg-background p-2 text-sm"
                  value={
                    Array.isArray(form.highlights)
                      ? form.highlights.join("\n")
                      : (form.highlights as any) || ""
                  }
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      highlights: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(form.permitRequired)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, permitRequired: e.target.checked }))
                }
              />
              <span className="text-sm">Permit required</span>
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
          <h1 className="text-3xl font-bold">Manage Hikes</h1>
          <p className="text-muted-foreground">Create, edit, activate/deactivate hikes.</p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Hike
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          placeholder="Search hikes (name, slug, location, difficulty)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:max-w-md"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Hikes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((h) => {
                const busy = busyId === h._id;
                return (
                  <TableRow key={h._id}>
                    <TableCell>
                      <div className="h-12 w-20 rounded-md bg-muted overflow-hidden border">
                        {h.imageUrl ? (
                          <img
                            src={h.imageUrl}
                            alt={h.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell className="text-muted-foreground">{h.slug}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{h.difficulty}</Badge>
                    </TableCell>
                    <TableCell>
                      Rs. {Math.round(h.baseFee || 0).toLocaleString("en-LK")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={h.isActive ? "default" : "outline"}>
                        {h.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => openViewDialog(h)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>

                        <Button size="sm" variant="outline" onClick={() => openEditDialog(h)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(h)}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : h.isActive ? (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          )}
                          {h.isActive ? "Disable" : "Enable"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(h)}
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No hikes found.
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
