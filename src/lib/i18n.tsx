import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "es" | "en";

export type Localized = { es: string; en: string };

/** Pick the right language string from a localized value. */
export function pick(value: Localized, locale: Locale): string {
  return value[locale];
}

const STORAGE_KEY = "pn-locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** UI-chrome strings (nav, buttons, form labels). Page content lives in content.ts. */
export const translations = {
  "brand.tagline": { es: "Cartografía & Ciencias de la Tierra", en: "Cartography & Earth Sciences" },

  "nav.home": { es: "Inicio", en: "Home" },
  "nav.services": { es: "Servicios", en: "Services" },
  "nav.portfolio": { es: "Portafolio", en: "Portfolio" },
  "nav.gallery": { es: "Galería", en: "Gallery" },
  "nav.layers": { es: "Capas", en: "Layers" },
  "nav.blog": { es: "Bitácora", en: "Journal" },
  "nav.about": { es: "Sobre mí", en: "About" },
  "nav.contact": { es: "Contacto", en: "Contact" },

  "cta.contact": { es: "Trabajemos juntos", en: "Let's work together" },
  "cta.explore": { es: "Explorar servicios", en: "Explore services" },
  "cta.viewWork": { es: "Ver portafolio", en: "View portfolio" },
  "cta.viewAll": { es: "Ver todo", en: "View all" },
  "cta.readMore": { es: "Leer más", en: "Read more" },
  "cta.inquire": { es: "Consultar", en: "Inquire" },
  "cta.back": { es: "Volver", en: "Back" },

  "common.featured": { es: "Destacado", en: "Featured" },
  "common.formats": { es: "Formatos", en: "Formats" },
  "common.catalogNote": {
    es: "Catálogo de muestra — contáctame para adquirir capas o solicitar conjuntos a medida.",
    en: "Sample catalog — contact me to acquire layers or request custom datasets.",
  },

  "gallery.title": { es: "Galería", en: "Gallery" },
  "gallery.intro": {
    es: "Mapas y láminas naturalistas disponibles como productos. Explora y consíguelos en la tienda.",
    en: "Maps and naturalist prints available as products. Browse and get them in the store.",
  },
  "gallery.filter.all": { es: "Todo", en: "All" },
  "gallery.filter.maps": { es: "Mapas", en: "Maps" },
  "gallery.filter.svg": { es: "SVG", en: "SVG" },
  "gallery.buy": { es: "Comprar en la tienda", en: "Buy in the store" },


  "contact.title": { es: "Hablemos", en: "Get in touch" },
  "contact.intro": {
    es: "Cuéntame sobre tu proyecto y te responderé pronto.",
    en: "Tell me about your project and I'll get back to you soon.",
  },
  "contact.name": { es: "Nombre", en: "Name" },
  "contact.company": { es: "Empresa", en: "Company" },
  "contact.email": { es: "Correo electrónico", en: "Email" },
  "contact.phone": { es: "Teléfono", en: "Phone" },
  "contact.subject": { es: "Asunto", en: "Subject" },
  "contact.message": { es: "Mensaje", en: "Message" },
  "contact.optional": { es: "opcional", en: "optional" },
  "contact.send": { es: "Enviar mensaje", en: "Send message" },
  "contact.sending": { es: "Enviando…", en: "Sending…" },
  "contact.success": {
    es: "¡Gracias! Tu mensaje fue recibido. Te responderé pronto.",
    en: "Thank you! Your message was received. I'll reply soon.",
  },
  "contact.error": {
    es: "Algo salió mal. Inténtalo de nuevo.",
    en: "Something went wrong. Please try again.",
  },

  "footer.rights": { es: "Todos los derechos reservados.", en: "All rights reserved." },
  "footer.madeWith": { es: "Mapas, datos y naturaleza.", en: "Maps, data, and nature." },
} satisfies Record<string, Localized>;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (stored === "es" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggle: () => setLocale(locale === "es" ? "en" : "es"),
      t: (key) => translations[key][locale],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
