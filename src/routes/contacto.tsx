import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { submitContact } from "@/lib/contact.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contacto")({
  validateSearch: (search: Record<string, unknown>): { contour?: number } => {
    const raw = Number(search.contour);
    return Number.isFinite(raw) ? { contour: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Contacto — Planispherium Nova" },
      {
        name: "description",
        content:
          "Contáctame para proyectos de cartografía, ciencias de la tierra y consultoría ambiental. Escríbeme con nombre, empresa, correo y teléfono.",
      },
      { property: "og:title", content: "Contacto — Planispherium Nova" },
      {
        property: "og:description",
        content: "Cuéntame sobre tu proyecto de cartografía o ciencias de la tierra.",
      },
    ],
    links: [{ rel: "canonical", href: "/contacto" }],
  }),
  component: ContactPage,
});

type Status = "idle" | "sending" | "success" | "error";

function ContactPage() {
  const { locale, t } = useLanguage();
  const send = useServerFn(submitContact);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    contourInterval: "100",
    message: "",
  });

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await send({
        data: {
          name: form.name,
          company: form.company,
          email: form.email,
          phone: form.phone,
          message: form.message,
          contourInterval: Number(form.contourInterval) || 100,
          locale,
        },
      });
      setStatus("success");
      setForm({ name: "", company: "", email: "", phone: "", contourInterval: "100", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{t("contact.title")}</h1>
      <p className="mt-3 text-muted-foreground">{t("contact.intro")}</p>

      <a
        href="mailto:plan.nova01@gmail.com"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        plan.nova01@gmail.com
      </a>

      <form onSubmit={onSubmit} className="mt-10 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("contact.name")}</Label>
            <Input
              id="name"
              required
              maxLength={100}
              value={form.name}
              onChange={update("name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">
              {t("contact.company")}{" "}
              <span className="text-muted-foreground">({t("contact.optional")})</span>
            </Label>
            <Input
              id="company"
              maxLength={150}
              value={form.company}
              onChange={update("company")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("contact.email")}</Label>
            <Input
              id="email"
              type="email"
              required
              maxLength={255}
              value={form.email}
              onChange={update("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              {t("contact.phone")}{" "}
              <span className="text-muted-foreground">({t("contact.optional")})</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              maxLength={40}
              value={form.phone}
              onChange={update("phone")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contourInterval">{t("contact.contour")}</Label>
          <Input
            id="contourInterval"
            type="number"
            min={1}
            max={10000}
            step={1}
            placeholder="100"
            value={form.contourInterval}
            onChange={update("contourInterval")}
          />
          <p className="text-xs text-muted-foreground">{t("contact.contourHint")}</p>
        </div>


        <div className="space-y-2">
          <Label htmlFor="message">{t("contact.message")}</Label>
          <Textarea
            id="message"
            required
            maxLength={2000}
            rows={6}
            value={form.message}
            onChange={update("message")}
          />
        </div>

        <Button type="submit" disabled={status === "sending"} className="gap-2">
          {status === "sending" ? t("contact.sending") : t("contact.send")}
          <Send className="h-4 w-4" />
        </Button>

        {status === "success" && (
          <p className="text-sm font-medium text-primary">{t("contact.success")}</p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium text-destructive">{t("contact.error")}</p>
        )}
      </form>
    </section>
  );
}
