import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, FileSpreadsheet, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/oficio")({
  head: () => ({
    meta: [
      { title: "Generador de Oficio Art. 59 — Planispherium Nova" },
      {
        name: "description",
        content: "Genera automáticamente el oficio de Opinión Técnica del Artículo 59 de la Ley Agraria.",
      },
    ],
  }),
  component: OficioPage,
});

type Estado = "idle" | "procesando" | "listo" | "error";

function OficioPage() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [excel, setExcel] = useState<File | null>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState("");
  const [urlDescarga, setUrlDescarga] = useState("");

  const handleSubmit = async () => {
    if (!pdf || !excel) {
      setMensajeError("Debes subir ambos archivos.");
      setEstado("error");
      return;
    }
    setEstado("procesando");
    setMensajeError("");
    const formData = new FormData();
    formData.append("pdf", pdf);
    formData.append("excel", excel);
    try {
      const response = await fetch("https://plannova.com.mx/api/oficio-art59", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Error en el servidor.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setUrlDescarga(url);
      setEstado("listo");
    } catch (err: any) {
      setMensajeError(err.message || "Error desconocido.");
      setEstado("error");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:py-32">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Generador de Oficio Art. 59
        </h1>
        <p className="mt-4 text-muted-foreground">
          Sube el oficio RAN en PDF y el Excel de parcelas. El sistema genera
          automáticamente el oficio de Opinión Técnica listo para revisar y firmar.
        </p>
      </div>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
            <FileText className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium text-foreground">Oficio RAN (PDF)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                El oficio de solicitud de opinión técnica escaneado
              </p>
            </div>
            {pdf ? (
              <span className="text-sm font-medium text-accent">{pdf.name}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Seleccionar archivo PDF</span>
            )}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
            <FileSpreadsheet className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium text-foreground">Excel de Parcelas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Una hoja con columnas <strong>PAR</strong> y <strong>VEG</strong> obligatorias
              </p>
            </div>
            {excel ? (
              <span className="text-sm font-medium text-accent">{excel.name}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Seleccionar archivo Excel</span>
            )}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setExcel(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={estado === "procesando"}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {estado === "procesando" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando oficio...
            </span>
          ) : (
            "Generar Oficio"
          )}
        </button>
        {estado === "listo" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-medium text-foreground">Oficio generado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa el documento antes de firmarlo.
            </p>
            <a
              href={urlDescarga}
              download="Oficio_Art59.docx"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              Descargar Word
            </a>
          </div>
        )}
        {estado === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 font-medium text-foreground">Error</p>
            <p className="mt-1 text-sm text-muted-foreground">{mensajeError}</p>
            <button
              onClick={() => setEstado("idle")}
              className="mt-4 text-sm text-accent underline"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
