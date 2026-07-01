import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Loader2, Layers, Download, Search } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/capas")({
  head: () => ({
    meta: [
      { title: "Capas — Planispherium Nova" },
      {
        name: "description",
        content:
          "Catálogo de capas geográficas descargables: Shapefile, GeoJSON, KML, TIFF y más. Filtra por tipo y descarga.",
      },
      { property: "og:title", content: "Capas — Planispherium Nova" },
      {
        property: "og:description",
        content: "Capas geográficas descargables en distintos formatos.",
      },
    ],
    links: [{ rel: "canonical", href: "/capas" }],
  }),
  component: CapasPage,
});

const BUCKET = "capas_archivos";
const TIPOS = ["Shapefile", "GeoJSON", "KML", "TIFF", "otros"] as const;

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
  intro: {
    es: "Catálogo de capas geográficas. Filtra por tipo, busca y descarga el archivo que necesites.",
    en: "Catalog of geographic layers. Filter by type, search, and download the file you need.",
  },
  search: { es: "Buscar por nombre o descripción…", en: "Search by name or description…" },
  allTypes: { es: "Todos los tipos", en: "All types" },
  empty: { es: "No hay capas que coincidan.", en: "No layers match." },
  download: { es: "Descargar", en: "Download" },
  add: { es: "Añadir capa", en: "Add layer" },
  newDesc: {
    es: "Sube un archivo de capa con sus datos.",
    en: "Upload a layer file with its data.",
  },
  name: { es: "Nombre", en: "Name" },
  description: { es: "Descripción", en: "Description" },
  type: { es: "Tipo", en: "Type" },
  file: { es: "Archivo", en: "File" },
  size: { es: "Tamaño", en: "Size" },
  sizeAuto: { es: "Automático si lo dejas vacío", en: "Automatic if left empty" },
  cancel: { es: "Cancelar", en: "Cancel" },
  save: { es: "Subir", en: "Upload" },
  saving: { es: "Subiendo…", en: "Uploading…" },
  success: { es: "Capa subida.", en: "Layer uploaded." },
  errorUpload: { es: "No se pudo subir la capa.", en: "Could not upload the layer." },
  requireFile: { es: "Selecciona un archivo.", en: "Select a file." },
  downloading: { es: "Descargando…", en: "Downloading…" },
  errorDownload: { es: "No se pudo descargar.", en: "Could not download." },
} as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

/** Resolve a stored value into a usable URL (external link or signed bucket URL). */
async function resolveUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

function CapasPage() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [items, setItems] = useState<CapaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useIsAdmin();

  const [query, setQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fNombre, setFNombre] = useState("");
  const [fDescripcion, setFDescripcion] = useState("");
  const [fTipo, setFTipo] = useState<string>("Shapefile");
  const [fTamano, setFTamano] = useState("");
  const [fFile, setFFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("capas")
      .select("*")
      .order("fecha_subida", { ascending: false });

    if (error) {
      toast.error(error.message);
      setItems([]);
      setLoading(false);
      return;
    }
    setItems((data ?? []) as CapaRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);


  const availableTypes = useMemo(
    () => Array.from(new Set(items.map((i) => i.tipo))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (tipoFilter !== "all" && i.tipo !== tipoFilter) return false;
      if (!q) return true;
      return (
        i.nombre.toLowerCase().includes(q) ||
        (i.descripcion?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, query, tipoFilter]);

  const handleDownload = async (capa: CapaRow) => {
    try {
      const url = await resolveUrl(capa.archivo_url);
      if (!url) {
        toast.error(L("errorDownload"));
        return;
      }
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const fileFromPath = capa.archivo_url?.split("/").pop() ?? capa.nombre;
      a.download = fileFromPath;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("[capas] download failed:", err);
      toast.error(L("errorDownload"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fFile) {
      toast.error(L("requireFile"));
      return;
    }
    setSubmitting(true);
    try {
      const ext = fFile.name.split(".").pop() ?? "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, fFile, { contentType: fFile.type || undefined, upsert: false });
      if (upErr) throw upErr;

      const tamano = fTamano.trim() || formatBytes(fFile.size);

      const { error: insErr } = await supabase.from("capas").insert({
        nombre: fNombre.trim(),
        descripcion: fDescripcion.trim() || null,
        tipo: fTipo,
        tamano,
        archivo_url: path,
      });
      if (insErr) throw insErr;

      toast.success(L("success"));
      setFormOpen(false);
      setFNombre("");
      setFDescripcion("");
      setFTipo("Shapefile");
      setFTamano("");
      setFFile(null);
      await load();
    } catch (err) {
      console.error("[capas] upload failed:", err);
      toast.error(L("errorUpload"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">Capas</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{L("intro")}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setFormOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            {L("add")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L("search")}
            className="pl-9"
          />
        </div>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{L("allTypes")}</SelectItem>
            {availableTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Layers className="h-10 w-10" />
          <p>{L("empty")}</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {filtered.map((capa) => (
            <li
              key={capa.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">{capa.nombre}</h2>
                  <Badge
                    variant="outline"
                    className={tipoBadge[capa.tipo] ?? tipoBadge.otros}
                  >
                    {capa.tipo}
                  </Badge>
                  {capa.tamano && (
                    <span className="text-xs text-muted-foreground">{capa.tamano}</span>
                  )}
                </div>
                {capa.descripcion && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {capa.descripcion.slice(0, 140)}
                    {capa.descripcion.length > 140 ? "…" : ""}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => handleDownload(capa)}
                disabled={!capa.archivo_url}
                className="shrink-0"
              >
                <Download className="h-4 w-4" />
                {L("download")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload form */}
      <Dialog open={formOpen} onOpenChange={(o) => !submitting && setFormOpen(o)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{L("add")}</DialogTitle>
            <DialogDescription>{L("newDesc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-nombre">{L("name")}</Label>
              <Input
                id="c-nombre"
                value={fNombre}
                onChange={(e) => setFNombre(e.target.value)}
                required
                maxLength={150}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-desc">{L("description")}</Label>
              <Textarea
                id="c-desc"
                value={fDescripcion}
                onChange={(e) => setFDescripcion(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-tipo">{L("type")}</Label>
              <Select value={fTipo} onValueChange={setFTipo}>
                <SelectTrigger id="c-tipo">
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
            <div className="space-y-2">
              <Label htmlFor="c-file">{L("file")}</Label>
              <Input
                id="c-file"
                type="file"
                onChange={(e) => setFFile(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-size">{L("size")}</Label>
              <Input
                id="c-size"
                value={fTamano}
                onChange={(e) => setFTamano(e.target.value)}
                placeholder={L("sizeAuto")}
                maxLength={40}
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
