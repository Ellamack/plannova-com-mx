import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Trash2, GripVertical, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PROYECTOS_BUCKET = "proyectos_imagenes";

const T = {
  reorderHint: {
    es: "Arrastra los elementos para cambiar el orden. Se guarda automáticamente.",
    en: "Drag items to reorder. Saved automatically.",
  },
  add: { es: "Añadir", en: "Add" },
  edit: { es: "Editar", en: "Edit" },
  delete: { es: "Eliminar", en: "Delete" },
  cancel: { es: "Cancelar", en: "Cancel" },
  save: { es: "Guardar", en: "Save" },
  saving: { es: "Guardando…", en: "Saving…" },
  name: { es: "Nombre", en: "Name" },
  title: { es: "Título", en: "Title" },
  description: { es: "Descripción", en: "Description" },
  technologies: { es: "Tecnologías (separadas por comas)", en: "Technologies (comma-separated)" },
  image: { es: "Imagen", en: "Image" },
  imageOptional: { es: "Imagen (opcional)", en: "Image (optional)" },
  empty: { es: "No hay elementos.", en: "No items." },
  confirmDelete: { es: "¿Eliminar este elemento?", en: "Delete this item?" },
  confirmDeleteDesc: {
    es: "Esta acción no se puede deshacer.",
    en: "This action cannot be undone.",
  },
  deleted: { es: "Elemento eliminado.", en: "Item deleted." },
  saved: { es: "Cambios guardados.", en: "Changes saved." },
  added: { es: "Elemento añadido.", en: "Item added." },
  reordered: { es: "Orden actualizado.", en: "Order updated." },
  error: { es: "Ocurrió un error.", en: "An error occurred." },
  newService: { es: "Nuevo servicio", en: "New service" },
  editService: { es: "Editar servicio", en: "Edit service" },
  newProject: { es: "Nuevo proyecto", en: "New project" },
  editProject: { es: "Editar proyecto", en: "Edit project" },
} as const;

async function resolveUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(PROYECTOS_BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

async function removeFile(value: string | null) {
  if (!value || /^https?:\/\//i.test(value)) return;
  await supabase.storage.from(PROYECTOS_BUCKET).remove([value]);
}

/* ============================ Servicios ============================ */

interface ServicioRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  fecha_creacion: string;
}

export function ServiciosAdmin() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof T) => T[k][locale];

  const [items, setItems] = useState<ServicioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicioRow | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ServicioRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .order("orden", { ascending: true })
      .order("fecha_creacion", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data ?? []) as ServicioRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setNombre("");
    setDescripcion("");
    setDialogOpen(true);
  };

  const openEdit = (row: ServicioRow) => {
    setEditing(row);
    setNombre(row.nombre);
    setDescripcion(row.descripcion ?? "");
    setDialogOpen(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("servicios")
          .update({ nombre: nombre.trim(), descripcion: descripcion.trim() || null })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success(L("saved"));
      } else {
        const nextOrden = items.length ? Math.max(...items.map((i) => i.orden)) + 1 : 0;
        const { error } = await supabase.from("servicios").insert({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          orden: nextOrden,
        });
        if (error) throw error;
        toast.success(L("added"));
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      console.error("[admin servicios] save failed:", err);
      toast.error(L("error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("servicios").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(L("deleted"));
      load();
    } catch (err) {
      console.error("[admin servicios] delete failed:", err);
      toast.error(L("error"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setItems(next);
    try {
      await Promise.all(
        next.map((row, idx) => supabase.from("servicios").update({ orden: idx }).eq("id", row.id)),
      );
      toast.success(L("reordered"));
      load();
    } catch (err) {
      console.error("[admin servicios] reorder failed:", err);
      toast.error(L("error"));
      load();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{L("reorderHint")}</p>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4" />
          {L("add")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{L("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row, index) => (
            <li
              key={row.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-opacity ${
                dragIndex === index ? "opacity-50" : ""
              }`}
            >
              <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-accent">{row.nombre}</p>
                {row.descripcion && (
                  <p className="truncate text-sm text-muted-foreground">{row.descripcion}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !saving && setDialogOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? L("editService") : L("newService")}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? L("editService") : L("newService")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-nombre">{L("name")}</Label>
              <Input
                id="s-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-desc">{L("description")}</Label>
              <Textarea
                id="s-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                {L("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? L("saving") : L("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{L("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{L("confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{L("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {L("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ============================ Proyectos ============================ */

interface ProyectoRow {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  tecnologias: string[];
  orden: number;
  fecha_creacion: string;
}

interface ProyectoItem extends ProyectoRow {
  resolvedUrl: string | null;
}

export function ProyectosAdmin() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof T) => T[k][locale];

  const [items, setItems] = useState<ProyectoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProyectoRow | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tecnologias, setTecnologias] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProyectoRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("proyectos")
      .select("*")
      .order("orden", { ascending: true })
      .order("fecha_creacion", { ascending: true });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as ProyectoRow[];
    const resolved = await Promise.all(
      rows.map(async (r) => ({ ...r, resolvedUrl: await resolveUrl(r.imagen_url) })),
    );
    setItems(resolved);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setTitulo("");
    setDescripcion("");
    setTecnologias("");
    setFile(null);
    setDialogOpen(true);
  };

  const openEdit = (row: ProyectoRow) => {
    setEditing(row);
    setTitulo(row.titulo);
    setDescripcion(row.descripcion ?? "");
    setTecnologias(row.tecnologias.join(", "));
    setFile(null);
    setDialogOpen(true);
  };

  const parseTec = (raw: string) =>
    raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imagen_url = editing?.imagen_url ?? null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(PROYECTOS_BUCKET)
          .upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (upErr) throw upErr;
        if (editing?.imagen_url) await removeFile(editing.imagen_url);
        imagen_url = path;
      }

      if (editing) {
        const { error } = await supabase
          .from("proyectos")
          .update({
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
            tecnologias: parseTec(tecnologias),
            imagen_url,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success(L("saved"));
      } else {
        const nextOrden = items.length ? Math.max(...items.map((i) => i.orden)) + 1 : 0;
        const { error } = await supabase.from("proyectos").insert({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          tecnologias: parseTec(tecnologias),
          imagen_url,
          orden: nextOrden,
        });
        if (error) throw error;
        toast.success(L("added"));
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      console.error("[admin proyectos] save failed:", err);
      toast.error(L("error"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("proyectos").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      await removeFile(deleteTarget.imagen_url);
      toast.success(L("deleted"));
      load();
    } catch (err) {
      console.error("[admin proyectos] delete failed:", err);
      toast.error(L("error"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setItems(next);
    try {
      await Promise.all(
        next.map((row, idx) => supabase.from("proyectos").update({ orden: idx }).eq("id", row.id)),
      );
      toast.success(L("reordered"));
      load();
    } catch (err) {
      console.error("[admin proyectos] reorder failed:", err);
      toast.error(L("error"));
      load();
    }
  };

  const tecList = useMemo(() => parseTec(tecnologias), [tecnologias]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{L("reorderHint")}</p>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4" />
          {L("add")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">{L("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row, index) => (
            <li
              key={row.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-opacity ${
                dragIndex === index ? "opacity-50" : ""
              }`}
            >
              <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
                {row.resolvedUrl ? (
                  <img src={row.resolvedUrl} alt={row.titulo} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-accent">{row.titulo}</p>
                {row.tecnologias.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {row.tecnologias.map((t) => (
                      <Badge key={t} variant="outline" className="border-accent/30 text-accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !saving && setDialogOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? L("editProject") : L("newProject")}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? L("editProject") : L("newProject")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-titulo">{L("title")}</Label>
              <Input
                id="p-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">{L("description")}</Label>
              <Textarea
                id="p-desc"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-tec">{L("technologies")}</Label>
              <Input
                id="p-tec"
                value={tecnologias}
                onChange={(e) => setTecnologias(e.target.value)}
                placeholder="Cartografía, DEM, SIG"
              />
              {tecList.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tecList.map((t) => (
                    <Badge key={t} variant="outline" className="border-accent/30 text-accent">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-file">{editing ? L("imageOptional") : L("image")}</Label>
              <Input
                id="p-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                {L("cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? L("saving") : L("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{L("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{L("confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{L("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {L("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
