import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useLanguage, pick } from "@/lib/i18n";
import { illustrations, type GalleryKind } from "@/lib/content";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { title: "Galería — Planispherium Nova" },
      {
        name: "description",
        content:
          "Galería de mapas y láminas naturalistas (SVG) disponibles como productos, con enlace a la tienda.",
      },
      { property: "og:title", content: "Galería — Planispherium Nova" },
      {
        property: "og:description",
        content: "Mapas y láminas naturalistas disponibles como productos.",
      },
    ],
    links: [{ rel: "canonical", href: "/galeria" }],
  }),
  component: GalleryPage,
});

type Filter = "all" | GalleryKind;

function GalleryPage() {
  const { locale, t } = useLanguage();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t("gallery.filter.all") },
    { key: "mapa", label: t("gallery.filter.maps") },
    { key: "svg", label: t("gallery.filter.svg") },
  ];

  const items = illustrations.filter((i) => filter === "all" || i.kind === filter);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{t("gallery.title")}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t("gallery.intro")}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`rounded-full border px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.slug}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={pick(item.title, locale)}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <span className="text-xs uppercase tracking-wide text-accent">
                {item.kind === "mapa" ? t("gallery.filter.maps") : t("gallery.filter.svg")}
              </span>
              <h2 className="mt-1 font-display text-lg font-semibold">{pick(item.title, locale)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{pick(item.source, locale)}</p>
              {item.storeUrl && (
                <a
                  href={item.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {t("gallery.buy")} <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
