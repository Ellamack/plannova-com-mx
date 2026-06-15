import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Planispherium Nova" },
      {
        name: "description",
        content: "Artículos sobre cartografía, teledetección y ciencias de la tierra.",
      },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        {locale === "es" ? "Blog" : "Blog"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {locale === "es"
          ? "Próximamente: artículos sobre cartografía, teledetección y ciencias de la tierra."
          : "Coming soon: articles on cartography, remote sensing and earth sciences."}
      </p>
    </section>
  );
}
