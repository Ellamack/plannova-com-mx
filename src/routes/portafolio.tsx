import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/portafolio")({
  head: () => ({
    meta: [
      { title: "Portafolio — Planispherium Nova" },
      {
        name: "description",
        content:
          "Proyectos de cartografía, SIG y teledetección. Una muestra del trabajo de Planispherium Nova.",
      },
      { property: "og:title", content: "Portafolio — Planispherium Nova" },
      {
        property: "og:description",
        content: "Proyectos de cartografía, SIG y teledetección.",
      },
    ],
    links: [{ rel: "canonical", href: "/portafolio" }],
  }),
  component: PortafolioPage,
});

const BUCKET = "proyectos_imagenes";

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

const labels = {
  intro: {
    es: "Una selección de proyectos cartográficos, SIG y de teledetección.",
    en: "A selection of cartography, GIS and remote sensing projects.",
  },
  empty: { es: "Aún no hay proyectos publicados.", en: "No projects published yet." },
} as const;

async function resolveUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? null;
}

function PortafolioPage() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [items, setItems] = useState<ProyectoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProyectoItem | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .order("orden", { ascending: true })
        .order("fecha_creacion", { ascending: true });
      if (error) {
        toast.error(error.message);
        setItems([]);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as ProyectoRow[];
      const resolved = await Promise.all(
        rows.map(async (r) => ({ ...r, resolvedUrl: await resolveUrl(r.imagen_url) })),
      );
      setItems(resolved);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Portafolio</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{L("intro")}</p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <ImageIcon className="h-10 w-10" />
          <p>{L("empty")}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-shadow hover:shadow-lg"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                {p.resolvedUrl ? (
                  <img
                    src={p.resolvedUrl}
                    alt={p.titulo}
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
                <h2 className="font-display text-lg font-semibold text-accent">{p.titulo}</h2>
                {p.descripcion && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.descripcion.slice(0, 110)}
                    {p.descripcion.length > 110 ? "…" : ""}
                  </p>
                )}
                {p.tecnologias.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tecnologias.map((t) => (
                      <Badge key={t} variant="outline" className="border-accent/30 text-accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
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
                <DialogTitle className="font-display text-2xl text-accent">
                  {selected.titulo}
                </DialogTitle>
                {selected.tecnologias.length > 0 && (
                  <DialogDescription asChild>
                    <span className="flex flex-wrap gap-1.5">
                      {selected.tecnologias.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="border-accent/30 text-accent"
                        >
                          {t}
                        </Badge>
                      ))}
                    </span>
                  </DialogDescription>
                )}
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
    </section>
  );
}
