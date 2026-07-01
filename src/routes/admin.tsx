import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Loader2,
  Compass,
  Pencil,
  Trash2,
  GripVertical,
  ImageIcon,
  Layers,
  LogOut,
  Briefcase,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ServiciosAdmin, ProyectosAdmin } from "@/components/admin/ContentAdmin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administración — Planispherium Nova" },
      { name: "description", content: "Panel de administración del contenido del sitio." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

const GALERIA_BUCKET = "galeria_imagenes";
const CAPAS_BUCKET = "capas_archivos";
const TIPOS = ["Shapefile", "GeoJSON", "KML", "TIFF", "otros"] as const;

interface GaleriaRow {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  fecha_creacion: string;
}

interface CapaRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  archivo_url: string | null;
  tipo: string;
  tamano: string | null;
  fecha_subida: string;
}

const tipoBadge: Record<string, string> = {
  Shapefile: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  GeoJSON: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  KML: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  TIFF: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  otros: "bg-muted text-muted-foreground border-border",
};

const labels = {
  title: { es: "Panel de administración", en: "Admin panel" },
  intro: {
    es: "Gestiona el contenido de galería, capas, servicios y proyectos.",
    en: "Manage gallery, layers, services and projects content.",
  },
  needAuth: {
    es: "Necesitas iniciar sesión para acceder al panel.",
    en: "You need to sign in to access the panel.",
  },
  goLogin: { es: "Ir a iniciar sesión", en: "Go to sign in" },
  signOut: { es: "Cerrar sesión", en: "Sign out" },
  signedOut: { es: "Sesión cerrada.", en: "Signed out." },
  tabGaleria: { es: "Galería", en: "Gallery" },
  tabCapas: { es: "Capas", en: "Layers" },
  tabServicios: { es: "Servicios", en: "Services" },
  tabProyectos: { es: "Proyectos", en: "Projects" },

  reorderHint: {
    es: "Arrastra las imágenes para cambiar el orden. Se guarda automáticamente.",
    en: "Drag images to reorder. Saved automatically.",
  },
  emptyGaleria: { es: "No hay imágenes.", en: "No images." },
  emptyCapas: { es: "No hay capas.", en: "No layers." },
  edit: { es: "Editar", en: "Edit" },
  delete: { es: "Eliminar", en: "Delete" },
  cancel: { es: "Cancelar", en: "Cancel" },
  save: { es: "Guardar", en: "Save" },
  saving: { es: "Guardando…", en: "Saving…" },
  editImage: { es: "Editar imagen", en: "Edit image" },
  editLayer: { es: "Editar capa", en: "Edit layer" },
  imgTitle: { es: "Título", en: "Title" },
  description: { es: "Descripción", en: "Description" },
  name: { es: "Nombre", en: "Name" },
  type: { es: "Tipo", en: "Type" },
  confirmDelete: { es: "¿Eliminar este elemento?", en: "Delete this item?" },
  confirmDeleteDesc: {
    es: "Se borrará el registro y su archivo. Esta acción no se puede deshacer.",
    en: "The record and its file will be removed. This cannot be undone.",
  },
  deleted: { es: "Elemento eliminado.", en: "Item deleted." },
  saved: { es: "Cambios guardados.", en: "Changes saved." },
  reordered: { es: "Orden actualizado.", en: "Order updated." },
  error: { es: "Ocurrió un error.", en: "An error occurred." },
} as const;

async function resolveUrl(bucket: string, value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

/** Remove a stored file from a bucket (only if it's a bucket path, not an external URL). */
async function removeFile(bucket: string, value: string | null) {
  if (!value || /^https?:\/\//i.test(value)) return;
  await supabase.storage.from(bucket).remove([value]);
}

function AdminPage() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuth(!!data.session);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuth(!!session);
      setAuthChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- Galería state ----
  const [galeria, setGaleria] = useState<(GaleriaRow & { resolvedUrl: string | null })[]>([]);
  const [loadingG, setLoadingG] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const loadGaleria = useCallback(async () => {
    setLoadingG(true);
    const { data, error } = await supabase
      .from("galeria")
      .select("*")
      .order("orden", { ascending: true })
      .order("fecha_creacion", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoadingG(false);
      return;
    }
    const rows = (data ?? []) as GaleriaRow[];
    const resolved = await Promise.all(
      rows.map(async (r) => ({
        ...r,
        resolvedUrl: await resolveUrl(GALERIA_BUCKET, r.imagen_url),
      })),
    );
    setGaleria(resolved);
    setLoadingG(false);
  }, []);

  // ---- Capas state ----
  const [capas, setCapas] = useState<CapaRow[]>([]);
  const [loadingC, setLoadingC] = useState(true);

  const loadCapas = useCallback(async () => {
    setLoadingC(true);
    const { data, error } = await supabase
      .from("capas")
      .select("*")
      .order("fecha_subida", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoadingC(false);
      return;
    }
    setCapas((data ?? []) as CapaRow[]);
    setLoadingC(false);
  }, []);

  useEffect(() => {
    if (isAuth) {
      loadGaleria();
      loadCapas();
    }
  }, [isAuth, loadGaleria, loadCapas]);

  // ---- Edit dialogs ----
  const [editG, setEditG] = useState<GaleriaRow | null>(null);
  const [gTitulo, setGTitulo] = useState("");
  const [gDescripcion, setGDescripcion] = useState("");

  const [editC, setEditC] = useState<CapaRow | null>(null);
  const [cNombre, setCNombre] = useState("");
  const [cDescripcion, setCDescripcion] = useState("");
  const [cTipo, setCTipo] = useState<string>("otros");

  const [savingEdit, setSavingEdit] = useState(false);

  const openEditG = (row: GaleriaRow) => {
    setEditG(row);
    setGTitulo(row.titulo);
    setGDescripcion(row.descripcion ?? "");
  };

  const openEditC = (row: CapaRow) => {
    setEditC(row);
    setCNombre(row.nombre);
    setCDescripcion(row.descripcion ?? "");
    setCTipo(row.tipo);
  };

  const saveEditG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editG) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from("galeria")
      .update({ titulo: gTitulo.trim(), descripcion: gDescripcion.trim() || null })
      .eq("id", editG.id);
    setSavingEdit(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(L("saved"));
    setEditG(null);
    loadGaleria();
  };

  const saveEditC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editC) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from("capas")
      .update({
        nombre: cNombre.trim(),
        descripcion: cDescripcion.trim() || null,
        tipo: cTipo,
      })
      .eq("id", editC.id);
    setSavingEdit(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(L("saved"));
    setEditC(null);
    loadCapas();
  };

  // ---- Delete ----
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "galeria"; row: GaleriaRow } | { kind: "capas"; row: CapaRow } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "galeria") {
        const { error } = await supabase.from("galeria").delete().eq("id", deleteTarget.row.id);
        if (error) throw error;
        await removeFile(GALERIA_BUCKET, deleteTarget.row.imagen_url);
      } else {
        const { error } = await supabase.from("capas").delete().eq("id", deleteTarget.row.id);
        if (error) throw error;
        await removeFile(CAPAS_BUCKET, deleteTarget.row.archivo_url);
      }
      toast.success(L("deleted"));
      if (deleteTarget.kind === "galeria") loadGaleria();
      else loadCapas();
    } catch (err) {
      console.error("[admin] delete failed:", err);
      toast.error(L("error"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ---- Drag & drop reorder (galería) ----
  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...galeria];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setGaleria(next);

    try {
      await Promise.all(
        next.map((row, idx) =>
          supabase.from("galeria").update({ orden: idx }).eq("id", row.id),
        ),
      );
      toast.success(L("reordered"));
      loadGaleria();
    } catch (err) {
      console.error("[admin] reorder failed:", err);
      toast.error(L("error"));
      loadGaleria();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(L("signedOut"));
    navigate({ to: "/login" });
  };

  if (!authChecked) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (!isAuth) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <Compass className="h-10 w-10 text-accent" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-semibold">{L("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{L("needAuth")}</p>
        <Button asChild className="mt-6">
          <Link to="/login">{L("goLogin")}</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">{L("title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{L("intro")}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="shrink-0">
          <LogOut className="h-4 w-4" />
          {L("signOut")}
        </Button>
      </div>

      <Tabs defaultValue="galeria" className="mt-8">
        <TabsList>
          <TabsTrigger value="galeria">
            <ImageIcon className="h-4 w-4" />
            {L("tabGaleria")}
          </TabsTrigger>
          <TabsTrigger value="capas">
            <Layers className="h-4 w-4" />
            {L("tabCapas")}
          </TabsTrigger>
          <TabsTrigger value="servicios">
            <Briefcase className="h-4 w-4" />
            {L("tabServicios")}
          </TabsTrigger>
          <TabsTrigger value="proyectos">
            <FolderKanban className="h-4 w-4" />
            {L("tabProyectos")}
          </TabsTrigger>
        </TabsList>

        {/* ---- Servicios ---- */}
        <TabsContent value="servicios" className="mt-6">
          <ServiciosAdmin />
        </TabsContent>

        {/* ---- Proyectos ---- */}
        <TabsContent value="proyectos" className="mt-6">
          <ProyectosAdmin />
        </TabsContent>


        {/* ---- Galería ---- */}
        <TabsContent value="galeria" className="mt-6">
          <p className="mb-4 text-sm text-muted-foreground">{L("reorderHint")}</p>
          {loadingG ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : galeria.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{L("emptyGaleria")}</p>
          ) : (
            <ul className="space-y-2">
              {galeria.map((row, index) => (
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
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                    {row.resolvedUrl ? (
                      <img
                        src={row.resolvedUrl}
                        alt={row.titulo}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.titulo}</p>
                    {row.descripcion && (
                      <p className="truncate text-sm text-muted-foreground">
                        {row.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditG(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ kind: "galeria", row })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ---- Capas ---- */}
        <TabsContent value="capas" className="mt-6">
          {loadingC ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : capas.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{L("emptyCapas")}</p>
          ) : (
            <ul className="space-y-2">
              {capas.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{row.nombre}</p>
                      <Badge variant="outline" className={tipoBadge[row.tipo] ?? tipoBadge.otros}>
                        {row.tipo}
                      </Badge>
                      {row.tamano && (
                        <span className="text-xs text-muted-foreground">{row.tamano}</span>
                      )}
                    </div>
                    {row.descripcion && (
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {row.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditC(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ kind: "capas", row })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit galería dialog */}
      <Dialog open={!!editG} onOpenChange={(o) => !o && !savingEdit && setEditG(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{L("editImage")}</DialogTitle>
            <DialogDescription className="sr-only">{L("editImage")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEditG} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-g-titulo">{L("imgTitle")}</Label>
              <Input
                id="e-g-titulo"
                value={gTitulo}
                onChange={(e) => setGTitulo(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-g-desc">{L("description")}</Label>
              <Textarea
                id="e-g-desc"
                value={gDescripcion}
                onChange={(e) => setGDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditG(null)} disabled={savingEdit}>
                {L("cancel")}
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {savingEdit ? L("saving") : L("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit capa dialog */}
      <Dialog open={!!editC} onOpenChange={(o) => !o && !savingEdit && setEditC(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{L("editLayer")}</DialogTitle>
            <DialogDescription className="sr-only">{L("editLayer")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEditC} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="e-c-nombre">{L("name")}</Label>
              <Input
                id="e-c-nombre"
                value={cNombre}
                onChange={(e) => setCNombre(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-c-desc">{L("description")}</Label>
              <Textarea
                id="e-c-desc"
                value={cDescripcion}
                onChange={(e) => setCDescripcion(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-c-tipo">{L("type")}</Label>
              <Select value={cTipo} onValueChange={setCTipo}>
                <SelectTrigger id="e-c-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditC(null)} disabled={savingEdit}>
                {L("cancel")}
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {savingEdit ? L("saving") : L("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
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
    </section>
  );
}
