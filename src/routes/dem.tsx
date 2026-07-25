import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDigit, Globe, Download, Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dem")({
  head: () => ({
    meta: [
      { title: "Recorte DEM — Planispherium Nova" },
      {
        name: "description",
        content: "Recorte DEM con curvas de nivel y derivados para cualquier zona de México.",
      },
    ],
    links: [{ rel: "canonical", href: "/dem" }],
  }),
  component: DemPage,
});

type Estado = "idle" | "procesando" | "listo" | "error";

function DemPage() {
  const { locale } = useLanguage();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [curvas, setCurvas] = useState(true);
  const [equidistancia, setEquidistancia] = useState("100");
  const [hillshade, setHillshade] = useState(true);
  const [slope, setSlope] = useState(false);
  const [slopeUnidades, setSlopeUnidades] = useState("grados");
  const [aspect, setAspect] = useState(false);
  const [formatoVectorial, setFormatoVectorial] = useState("shp");
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState("");
  const [urlDescarga, setUrlDescarga] = useState("");

  const handleSubmit = async () => {
    if (!archivo) {
      setMensajeError(locale === "es" ? "Debes subir un archivo." : "You must upload a file.");
      setEstado("error");
      return;
    }
    setEstado("procesando");
    setMensajeError("");

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("curvas", String(curvas));
    formData.append("equidistancia", equidistancia || "100");
    formData.append("hillshade", String(hillshade));
    formData.append("slope", String(slope));
    formData.append("slope_unidades", slopeUnidades);
    formData.append("aspect", String(aspect));
    formData.append("formato_vectorial", formatoVectorial);

    try {
      const response = await fetch("https://plannova.com.mx/api/dem/procesar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.detail || "Error en el servidor.");
      }
      const blob = await response.blob();
      setUrlDescarga(URL.createObjectURL(blob));
      setEstado("listo");
    } catch (err: any) {
      setMensajeError(err.message || "Error desconocido.");
      setEstado("error");
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:py-32">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Globe className="h-3.5 w-3.5 text-accent" />
          {locale === "es" ? "Cobertura México" : "Mexico coverage"}
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {locale === "es"
            ? "Recorte DEM con curvas de nivel y derivados"
            : "DEM clip with contour lines and derivatives"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {locale === "es"
            ? "Sube tu polígono y recibe tu modelo digital de elevaciones listo para trabajar."
            : "Upload your polygon and receive your digital elevation model ready to work."}
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
            <Upload className="h-8 w-8 text-accent" />
            <div>
              <p className="font-medium text-foreground">
                {locale === "es" ? "Polígono de tu área" : "Your area polygon"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "es"
                  ? "SHP en ZIP, KML, KMZ o GeoJSON"
                  : "SHP in ZIP, KML, KMZ or GeoJSON"}
              </p>
            </div>
            {archivo ? (
              <span className="text-sm font-medium text-accent">{archivo.name}</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                {locale === "es" ? "Seleccionar archivo" : "Select file"}
              </span>
            )}
            <input
              type="file"
              accept=".zip,.kml,.kmz,.geojson"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[".zip (shp)", ".kml", ".kmz", ".geojson"].map((fmt) => (
              <span
                key={fmt}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground"
              >
                <FileDigit className="h-3 w-3 text-accent" />
                {fmt}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-base font-semibold text-foreground">
            {locale === "es" ? "Productos a generar" : "Products to generate"}
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={curvas}
                  onChange={(e) => setCurvas(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm text-foreground">
                  {locale === "es" ? "Curvas de nivel" : "Contour lines"}
                </span>
              </label>
              {curvas && (
                <div className="ml-7 mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {locale === "es" ? "Equidistancia (m):" : "Interval (m):"}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={equidistancia}
                    onChange={(e) => setEquidistancia(e.target.value)}
                    className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hillshade}
                onChange={(e) => setHillshade(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-foreground">
                {locale === "es" ? "Sombreado (hillshade)" : "Hillshade"}
              </span>
            </label>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={slope}
                  onChange={(e) => setSlope(e.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm text-foreground">
                  {locale === "es" ? "Pendiente (slope)" : "Slope"}
                </span>
              </label>
              {slope && (
                <div className="ml-7 mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSlopeUnidades("grados")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      slopeUnidades === "grados"
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {locale === "es" ? "Grados" : "Degrees"}
                  </button>
                  <button
                    onClick={() => setSlopeUnidades("porcentaje")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      slopeUnidades === "porcentaje"
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {locale === "es" ? "Porcentaje" : "Percent"}
                  </button>
                </div>
              )}
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aspect}
                onChange={(e) => setAspect(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              <span className="text-sm text-foreground">
                {locale === "es" ? "Orientación (aspect)" : "Aspect"}
              </span>
            </label>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">
              {locale === "es" ? "Formato de salida vectorial" : "Vector output format"}
            </p>
            <div className="mt-2 flex gap-2">
              {["shp", "kmz", "geojson"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormatoVectorial(fmt)}
                  className={`rounded-md px-3 py-1 text-xs font-medium uppercase transition-colors ${
                    formatoVectorial === fmt
                      ? "bg-accent text-accent-foreground"
                      : "border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={estado === "procesando"}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estado === "procesando" ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {locale === "es" ? "Procesando..." : "Processing..."}
            </span>
          ) : locale === "es" ? (
            "Procesar mi área"
          ) : (
            "Process my area"
          )}
        </button>

        {estado === "listo" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-medium text-foreground">
              {locale === "es" ? "Proceso completado" : "Process completed"}
            </p>
            <a
              href={urlDescarga}
              download="resultado_dem.zip"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              {locale === "es" ? "Descargar ZIP" : "Download ZIP"}
           </a>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                {locale === "es" ? "¿Te fue útil?" : "Was this useful?"}
              </p>
              
                href="https://ko-fi.com/plannova01"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 transition-colors hover:bg-yellow-500/20"
              >
                ☕ {locale === "es" ? "Invítame un café" : "Buy me a coffee"}
              </a>
            </div>
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
              {locale === "es" ? "Intentar de nuevo" : "Try again"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
