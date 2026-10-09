import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Map, Layers, Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre mí — Planispherium Nova" },
      {
        name: "description",
        content:
          "Conoce Planispherium Nova: cartografía, SIG, teledetección y consultoría ambiental.",
      },
      { property: "og:title", content: "Sobre mí — Planispherium Nova" },
      {
        property: "og:description",
        content: "Cartografía, SIG, teledetección y consultoría ambiental.",
      },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: AboutPage,
});

const labels = {
  intro: {
    es: "Planispherium Nova es un estudio independiente de cartografía y geotecno­logías. Combino SIG, teledetección y diseño cartográfico para producir mapas claros, precisos y con carácter propio.",
    en: "Planispherium Nova is an independent cartography and geotechnology studio. I combine GIS, remote sensing and cartographic design to produce maps that are clear, precise and distinctive.",
  },
  body: {
    es: "Trabajo con organismos, empresas y personas que necesitan entender el territorio: desde recortes DEM con curvas de nivel hasta estudios técnicos justificativos y trámites ambientales.",
    en: "I work with institutions, companies and individuals who need to understand territory: from DEM clips with contour lines to technical justification studies and environmental permitting.",
  },
  pillarsTitle: { es: "Qué hago", en: "What I do" },
  pillar1Title: { es: "Cartografía", en: "Cartography" },
  pillar1: {
    es: "Mapas temáticos del medio físico, socioeconómico, hidrología, infraestructura y más.",
    en: "Thematic maps of the physical environment, socioeconomics, hydrology, infrastructure and more.",
  },
  pillar2Title: { es: "SIG y análisis", en: "GIS & analysis" },
  pillar2: {
    es: "Modelos de elevación, capas de datos y análisis espacial para tus proyectos.",
    en: "Elevation models, data layers and spatial analysis for your projects.",
  },
  pillar3Title: { es: "Consultoría ambiental", en: "Environmental consulting" },
  pillar3: {
    es: "Manifestaciones de impacto ambiental, estudios técnicos y gestión de trámites.",
    en: "Environmental impact statements, technical studies and permitting management.",
  },
  cta: { es: "Hablemos de tu proyecto", en: "Let's talk about your project" },
} as const;

function AboutPage() {
  const { locale } = useLanguage();
  const L = (k: keyof typeof labels) => labels[k][locale];

  const pillars = [
    { icon: Map, title: L("pillar1Title"), text: L("pillar1") },
    { icon: Layers, title: L("pillar2Title"), text: L("pillar2") },
    { icon: Leaf, title: L("pillar3Title"), text: L("pillar3") },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="flex items-center gap-3">
        <Compass className="h-8 w-8 text-accent" strokeWidth={1.5} />
        <h1 className="font-display text-4xl font-semibold">
          {locale === "es" ? "Sobre mí" : "About"}
        </h1>
      </div>
      <p className="mt-6 text-lg leading-relaxed text-foreground/90">{L("intro")}</p>
      <p className="mt-4 leading-relaxed text-muted-foreground">{L("body")}</p>

      <h2 className="mt-12 font-display text-2xl font-semibold">{L("pillarsTitle")}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-lg border border-border bg-card p-5">
            <p.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <h3 className="mt-3 font-display font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button asChild>
          <Link to="/contacto">{L("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
