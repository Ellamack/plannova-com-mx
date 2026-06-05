import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Layers, Satellite, Leaf, Map } from "lucide-react";
import { useLanguage, pick } from "@/lib/i18n";
import { assets, services, projects } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planispherium Nova — Cartografía, SIG y Teledetección" },
      {
        name: "description",
        content:
          "Estudio de cartografía y ciencias de la tierra: SIG, teledetección, consultoría ambiental, capas de datos y galería naturalista.",
      },
      { property: "og:title", content: "Planispherium Nova" },
      { property: "og:description", content: "Cartografía, SIG, teledetección y consultoría ambiental." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const iconMap = { Layers, Satellite, Leaf, Map } as const;

function Index() {
  const { locale, t } = useLanguage();

  return (
    <>
      <section className="relative overflow-hidden">
        <img
          src={assets.heroCartography}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-accent" /> {t("brand.tagline")}
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            {locale === "es"
              ? "Mapas que revelan el territorio."
              : "Maps that reveal the landscape."}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {locale === "es"
              ? "Cartografía, SIG, teledetección y consultoría ambiental — con rigor científico y un toque de arte naturalista. ¡Vamos, ánimo!"
              : "Cartography, GIS, remote sensing, and environmental consulting — with scientific rigor and a touch of naturalist art."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/servicios"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("cta.explore")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portafolio"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              {t("cta.viewWork")}
            </Link>
          </div>
        </div>
      </section>

      <section className="graticule">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold">{t("nav.services")}</h2>
            <Link to="/servicios" className="text-sm text-primary hover:text-accent">
              {t("cta.viewAll")} →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap] ?? Map;
              return (
                <div
                  key={s.slug}
                  className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  <h3 className="mt-4 font-display text-lg font-semibold">{pick(s.title, locale)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pick(s.summary, locale)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">{t("nav.portfolio")}</h2>
          <Link to="/portafolio" className="text-sm text-primary hover:text-accent">
            {t("cta.viewAll")} →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <article key={p.slug} className="group overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-[5/4] overflow-hidden">
                <img
                  src={p.image}
                  alt={pick(p.title, locale)}
                  loading="lazy"
                  width={1000}
                  height={800}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-accent">{pick(p.category, locale)}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{pick(p.title, locale)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pick(p.description, locale)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              {locale === "es" ? "¿Tienes un proyecto en mente?" : "Have a project in mind?"}
            </h2>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              {locale === "es"
                ? "Cuéntame qué territorio quieres entender y construyamos el mapa juntos."
                : "Tell me which landscape you want to understand and let's build the map together."}
            </p>
          </div>
          <Link
            to="/contacto"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform hover:scale-105"
          >
            {t("cta.contact")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
