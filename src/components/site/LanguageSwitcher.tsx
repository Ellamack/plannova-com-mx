import { useLanguage } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs font-medium">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
            locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
