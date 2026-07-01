import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Loader2, ImageIcon, Search } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galería — Planispherium Nova" },
      {
        name: "description",
        content:
          "Galería de mapas, láminas y productos cartográficos. Explora las imágenes y conoce el detalle de cada pieza.",
      },
      { property: "og:title", content: "Galería — Planispherium Nova" },
      {
        property: "og:description",
        content: "Mapas, láminas y productos cartográficos en imágenes.",
      },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: GalleryPage,
});

const BUCKET = "galeria_imagenes";

interface GaleriaRow {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  fecha_creacion: string;
}

interface GaleriaItem extends GaleriaRow {
  resolvedUrl: string | null;
}

const labels = {
  intro: {
    es: "Mapas, láminas y productos cartográficos. Haz clic en cualquier pieza para ver el detalle.",
    en: "Maps, plates and cartographic products. Click any piece to see the detail.",
  },
  empty: { es: "Aún no hay imágenes en la galería.", en: "No images in the gallery yet." },
  noMatch: { es: "No hay imágenes que coincidan.", en: "No images match." },
  search: { es: "Buscar por título o descripción…", en: "Search by title or description…" },
  add: { es: "Añadir imagen", en: "Add image" },
  uploaded: { es: "Subida el", en: "Uploaded on" },
  newImage: { es: "Nueva imagen", en: "New image" },
  newImageDesc: {
    es: "Sube una imagen a la galería con su título y descripción.",
    en: "Upload an image to the gallery with its title and description.",
  },
  title: { es: "Título", en: "Title" },
  description: { es: "Descripción", en: "Description" },
  file: { es: "Imagen", en: "Image" },
  cancel: { es: "Cancelar", en: "Cancel" },
  save: { es: "Subir", en: "Upload" },
  saving: { es: "Subiendo…", en: "Uploading…" },
  successUpload: { es: "Imagen subida.", en: "Image uploaded." },
  errorUpload: { es: "No se pudo subir la imagen.", en: "Could not upload the image." },
  requireFile: { es: "Selecciona una imagen.", en: "Select an image." },
} as const;

/** Resolve a stored value into a displayable URL (external link or signed bucket URL). */
async function resolveUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

function GalleryPage() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useIsAdmin();
  const [selected, setSelected] = useState<GaleriaItem | null>(null);
  const [query, setQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fTitulo, setFTitulo] = useState("");
  const [fDescripcion, setFDescripcion] = useState("");
  const [fFile, setFFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("galeria")
      .select("*")
      .order("orden", { ascending: true })
      .order("fecha_creacion", { ascending: false });

    if (error) {
      toast.error(error.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as GaleriaRow[];
    const resolved = await Promise.all(
      rows.map(async (r) => ({ ...r, resolvedUrl: await resolveUrl(r.imagen_url) })),
    );
    setItems(resolved);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.titulo.toLowerCase().includes(q) ||
        (i.descripcion?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fFile) {
      toast.error(L("requireFile"));
      return;
    }
    setSubmitting(true);
    try {
      const ext = fFile.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, fFile, { contentType: fFile.type, upsert: false });
      if (upErr) throw upErr;

      const nextOrden = items.length ? Math.max(...items.map((i) => i.orden)) + 1 : 0;

      const { error: insErr } = await supabase.from("galeria").insert({
        titulo: fTitulo.trim(),
        descripcion: fDescripcion.trim() || null,
        imagen_url: path,
        orden: nextOrden,
      });
      if (insErr) throw insErr;

      toast.success(L("successUpload"));
      setFormOpen(false);
      setFTitulo("");
      setFDescripcion("");
      setFFile(null);
      await load();
    } catch (err) {
      console.error("[galeria] upload failed:", err);
      toast.error(L("errorUpload"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Galería</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{L("intro")}</p>
        </div>
        {isAuth && (
          <Button onClick={() => setFormOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            {L("add")}
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="mt-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L("search")}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <ImageIcon className="h-10 w-10" />
          <p>{L("empty")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <ImageIcon className="h-10 w-10" />
          <p>{L("noMatch")}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-shadow hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {item.resolvedUrl ? (
                  <img
                    src={item.resolvedUrl}
                    alt={item.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-semibold">{item.titulo}</h2>
                {item.descripcion && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.descripcion.slice(0, 100)}
                    {item.descripcion.length > 100 ? "…" : ""}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selected.titulo}</DialogTitle>
                <DialogDescription>
                  {L("uploaded")}{" "}
                  {new Date(selected.fecha_creacion).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </DialogDescription>
              </DialogHeader>
              {selected.resolvedUrl && (
                <div className="overflow-hidden rounded-md bg-muted">
                  <img
                    src={selected.resolvedUrl}
                    alt={selected.titulo}
                    className="max-h-[60vh] w-full object-contain"
                  />
                </div>
              )}
              {selected.descripcion && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {selected.descripcion}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>



      {/* Upload form */}
      <Dialog open={formOpen} onOpenChange={(o) => !submitting && setFormOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{L("newImage")}</DialogTitle>
            <DialogDescription>{L("newImageDesc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="g-titulo">{L("title")}</Label>
              <Input
                id="g-titulo"
                value={fTitulo}
                onChange={(e) => setFTitulo(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-desc">{L("description")}</Label>
              <Textarea
                id="g-desc"
                value={fDescripcion}
                onChange={(e) => setFDescripcion(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="g-file">{L("file")}</Label>
              <Input
                id="g-file"
                type="file"
                accept="image/*"
                onChange={(e) => setFFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                {L("cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? L("saving") : L("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
