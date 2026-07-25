import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { site } from "@/lib/content";

const links = [
  { to: "/servicios", key: "nav.services" },
  { to: "/portafolio", key: "nav.portfolio" },
  { to: "/galeria", key: "nav.gallery" },
  { to: "/capas", key: "nav.layers" },
  { to: "/blog", key: "nav.blog" },
  { to: "/contacto", key: "nav.contact" },
] as const;

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-accent" strokeWidth={1.5} />
            <span className="font-display text-lg font-semibold">{site.name}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t("footer.madeWith")}</p>
          <a 
            href="https://ko-fi.com/plannova01"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-500/20 dark:text-yellow-400"
          >
            ☕ {t("nav.home") === "Home" ? "Buy me a coffee (USD)" : "Invítame un café (USD)"}
          </a>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 md:justify-end">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>
            © {new Date().getFullYear()} {site.name}. {t("footer.rights")}
          </span>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            {t("nav.home") === "Home" ? "Admin" : "Administración"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
