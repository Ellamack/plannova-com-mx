import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileDigit, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dem")({
  head: () => ({
    meta: [
      { title: "Recorte DEM — Planispherium Nova" },
      {
        name: "description",
        content:
          "Solicita tu recorte DEM con curvas de nivel y derivados para cualquier zona de México o el mundo.",
      },
    ],
    links: [{ rel: "canonical", href: "/dem" }],
  }),
  component: DemPage,
});

function DemPage() {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Globe className="h-3.5 w-3.5 text-accent" />
        {locale === "es" ? "Servicio disponible" : "Service available"}
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {locale === "es"
          ? "Recorte DEM con curvas de nivel y derivados"
          : "DEM clip with contour lines and derivatives"}
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        {locale === "es"
          ? "Sube tu polígono en .shp, .kml, .kmz o .geojson y recibe tu modelo digital de elevaciones listo para trabajar."
          : "Upload your polygon in .shp, .kml, .kmz or .geojson and receive your digital elevation model ready to work."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[".shp", ".kml", ".kmz", ".geojson"].map((fmt) => (
          <span
            key={fmt}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            <FileDigit className="h-3 w-3 text-accent" />
            {fmt}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <Link
          to="/contacto"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-105"
        >
          {locale === "es" ? "Solicitar recorte DEM" : "Request DEM clip"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
