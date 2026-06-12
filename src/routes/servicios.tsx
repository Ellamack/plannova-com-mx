import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Compass } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios — Planispherium Nova" },
      {
        name: "description",
        content:
          "Servicios de cartografía, SIG, teledetección y consultoría ambiental. Soluciones geoespaciales a tu medida.",
      },
      { property: "og:title", content: "Servicios — Planispherium Nova" },
      {
        property: "og:description",
        content: "Cartografía, SIG, teledetección y consultoría ambiental.",
      },
    ],
    links: [{ rel: "canonical", href: "/servicios" }],
  }),
  component: ServiciosPage,
});

interface ServicioRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  fecha_creacion: string;
}

const labels = {
  intro: {
    es: "Soluciones geoespaciales y ambientales diseñadas con precisión y oficio.",
    en: "Geospatial and environmental solutions crafted with precision and care.",
  },
  empty: { es: "Aún no hay servicios publicados.", en: "No services published yet." },
} as const;

function ServiciosPage() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const [items, setItems] = useState<ServicioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .order("orden", { ascending: true })
        .order("fecha_creacion", { ascending: true });
      if (error) {
        toast.error(error.message);
        setItems([]);
      } else {
        setItems((data ?? []) as ServicioRow[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">Servicios</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{L("intro")}</p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Compass className="h-10 w-10" strokeWidth={1.5} />
          <p>{L("empty")}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((s) => (
            <article
              key={s.id}
              className="flex flex-col rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Compass className="h-6 w-6 shrink-0 text-accent" strokeWidth={1.5} />
                <h2 className="font-display text-xl font-semibold text-accent">{s.nombre}</h2>
              </div>
              {s.descripcion && (
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {s.descripcion}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
