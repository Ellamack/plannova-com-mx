import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Images,
  Leaf,
  Layers,
  BookOpen,
  FileDigit,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { assets } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planispherium Nova — Recorte DEM, curvas de nivel y derivados" },
      {
        name: "description",
        content:
          "Recorte de DEM, curvas de nivel y derivados para cualquier zona de México y el mundo. Sube tu polígono y recibe tu modelo digital listo.",
      },
      { property: "og:title", content: "Planispherium Nova" },
      {
        property: "og:description",
        content: "Recorte DEM, curvas de nivel y derivados para cualquier zona.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const exploreCards = [
  {
    to: "/galeria",
    icon: Images,
    title: { es: "Galería de ilustraciones SVG", en: "SVG Illustration Gallery" },
    description: {
      es: "Mapas y láminas naturalistas disponibles como productos digitales.",
      en: "Maps and naturalist prints available as digital products.",
    },
  },
  {
    to: "/servicios",
    icon: Leaf,
    title: { es: "Consultoría Ambiental", en: "Environmental Consulting" },
    description: {
      es: "Trámites y estudios ambientales ante ASEA, SEMARNAT y SEDEMA CDMX.",
      en: "Environmental permits and studies before ASEA, SEMARNAT and SEDEMA CDMX.",
    },
  },
  {
    to: "/capas",
    icon: Layers,
    title: { es: "Capas GIS", en: "GIS Layers" },
    description: {
      es: "Red hidrográfica, curvas de nivel, cobertura vegetal y más.",
      en: "Hydrographic network, contour lines, vegetation cover and more.",
    },
  },
  {
    to: "/blog",
    icon: BookOpen,
    title: { es: "Blog", en: "Blog" },
    description: {
      es: "Artículos sobre cartografía, teledetección y ciencias de la tierra.",
      en: "Articles on cartography, remote sensing and earth sciences.",
    },
  },
  {
    to: "/oficio",
    icon: FileDigit,
    title: { es: "🟥 Alfombra Roja — Personal SEMARNAT", en: "🟥 Red Carpet — SEMARNAT Staff" },
    description: {
      es: "¿Eres de SEMARNAT? Aquí no juzgamos a nadie. Genera tus oficios Art. 59 y dictamen en segundos.",
      en: "SEMARNAT staff only. Generate your Art. 59 official letters in seconds.",
    },
  },
];

function Index() {
  const { locale } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <img
          src={assets.heroCartography}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-accent" />
            {locale === "es" ? "México y el mundo" : "Mexico and worldwide"}
          </div>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {locale === "es"
              ? "Recorte DEM con curvas de nivel y derivados"
              : "DEM clip with contour lines and derivatives"}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {locale === "es"
              ? "Sube tu polígono y recibe tu modelo digital de elevaciones listo para trabajar. Cualquier zona de México o el mundo."
              : "Upload your polygon and receive your digital elevation model ready to work. Any area in Mexico or worldwide."}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/dem"
              className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-105"
            >
              {locale === "es" ? "Procesar mi área ahora" : "Process my area now"}
              <ArrowRight className="h-5 w-5" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                {locale === "es" ? "Formatos: " : "Formats: "}
              </span>
              {[".shp", ".kml", ".kmz", ".geojson"].map((fmt) => (
                <span
                  key={fmt}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  <FileDigit className="h-3 w-3 text-accent" />
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Explore cards */}
      <section className="relative z-10 border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exploreCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/50 hover:bg-accent/5"
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className="h-6 w-6 text-accent transition-transform group-hover:scale-110"
                      strokeWidth={1.5}
                    />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                    {locale === "es" ? card.title.es : card.title.en}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {locale === "es" ? card.description.es : card.description.en}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
