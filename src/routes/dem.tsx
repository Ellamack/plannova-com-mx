import { useState, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, Upload, Square, PenLine, Trash2, Loader2, Download, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dem")({
  head: () => ({
    meta: [
      { title: "Recorte DEM — Planispherium Nova" },
      {
        name: "description",
        content: "Recorte DEM con curvas de nivel y derivados. Dibuja tu área en el mapa o sube tu archivo.",
      },
    ],
    links: [
      { rel: "canonical", href: "/dem" },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
    ],
  }),
  component: DemPage,
});

type ModoEntrada = "mapa-poligono" | "mapa-rectangulo" | "archivo";
type Estado = "idle" | "procesando" | "listo" | "error";

function DemPage() {
  const { locale } = useLanguage();
  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>("mapa-poligono");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);

  useEffect(() => {
    if (modoEntrada === "archivo") return;
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    // Carga dinámica de Leaflet
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      // Fix icono por defecto de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [23.5, -102],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;
      mapInstanceRef.current = map;

      // Herramienta de dibujo
      if (modoEntrada === "mapa-poligono") {
        map.on("click", (e: any) => {
          // modo polígono — se maneja con el toolbar
        });
      }

      // Leaflet.draw para polígono y rectángulo
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.min.js";
      script.onload = () => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css";
        document.head.appendChild(link);

        const drawControl = new (window as any).L.Control.Draw({
          edit: { featureGroup: drawnItems },
          draw: {
            polygon: modoEntrada === "mapa-poligono" ? {} : false,
            rectangle: modoEntrada === "mapa-rectangulo" ? {} : false,
            polyline: false,
            circle: false,
            circlemarker: false,
            marker: false,
          },
        });
        map.addControl(drawControl);

        map.on((window as any).L.Draw.Event.CREATED, (e: any) => {
          drawnItems.clearLayers();
          drawnItems.addLayer(e.layer);
          const gj = drawnItems.toGeoJSON();
          setGeojson(gj);
        });
      };
      document.head.appendChild(script);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [modoEntrada]);

  const limpiarMapa = () => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
    setGeojson(null);
  };

  const handleSubmit = async () => {
    if (!geojson && !archivo) {
      setMensajeError(locale === "es" ? "Dibuja o sube un área primero." : "Draw or upload an area first.");
      setEstado("error");
      return;
    }
    setEstado("procesando");
    setMensajeError("");

    const formData = new FormData();
    
    if (geojson) {
      const blob = new Blob([JSON.stringify(geojson)], { type: "application/geo+json" });
      formData.append("archivo", blob, "area.geojson");
    } else if (archivo) {
      formData.append("archivo", archivo);
    }

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
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          <Globe className="h-3.5 w-3.5 text-accent" />
          {locale === "es" ? "Cobertura México" : "Mexico coverage"}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {locale === "es" ? "Recorte DEM con curvas de nivel y derivados" : "DEM clip with contour lines and derivatives"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {locale === "es"
            ? "Define tu área en el mapa o sube tu archivo. Recibe DEM, curvas de nivel y más."
            : "Define your area on the map or upload your file. Get DEM, contour lines and more."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel izquierdo — opciones */}
        <div className="space-y-4">
          {/* Modo de entrada */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {locale === "es" ? "¿Cómo defines tu área?" : "How do you define your area?"}
            </p>
            <div className="space-y-2">
              {[
                { id: "mapa-poligono", icon: PenLine, label: locale === "es" ? "Dibujar polígono" : "Draw polygon" },
                { id: "mapa-rectangulo", icon: Square, label: locale === "es" ? "Trazar rectángulo" : "Draw rectangle" },
                { id: "archivo", icon: Upload, label: locale === "es" ? "Subir archivo" : "Upload file" },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setModoEntrada(id as ModoEntrada); setGeojson(null); setArchivo(null); }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    modoEntrada === id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Subir archivo (solo cuando el modo es archivo) */}
          {modoEntrada === "archivo" && (
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="flex flex-col items-center gap-2 cursor-pointer text-center">
                <Upload className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {archivo ? archivo.name : locale === "es" ? "Seleccionar archivo" : "Select file"}
                </span>
                <span className="text-xs text-muted-foreground">SHP·ZIP, KML, KMZ, GeoJSON</span>
                <input
                  type="file"
                  accept=".zip,.kml,.kmz,.geojson"
                  className="hidden"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          )}

          {/* Productos */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {locale === "es" ? "Productos" : "Products"}
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={curvas} onChange={(e) => setCurvas(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                <span className="text-sm text-foreground">{locale === "es" ? "Curvas de nivel" : "Contour lines"}</span>
              </label>
              {curvas && (
                <div className="ml-5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{locale === "es" ? "Equidistancia (m):" : "Interval (m):"}</span>
                  <input
                    type="number" min={1} max={10000} value={equidistancia}
                    onChange={(e) => setEquidistancia(e.target.value)}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hillshade} onChange={(e) => setHillshade(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                <span className="text-sm text-foreground">Hillshade</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={slope} onChange={(e) => setSlope(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                <span className="text-sm text-foreground">Slope</span>
              </label>
              {slope && (
                <div className="ml-5 flex gap-2">
                  {["grados", "porcentaje"].map((u) => (
                    <button key={u} onClick={() => setSlopeUnidades(u)}
                      className={`rounded px-2 py-1 text-xs font-medium transition-colors ${slopeUnidades === u ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"}`}>
                      {u === "grados" ? (locale === "es" ? "Grados" : "Degrees") : (locale === "es" ? "Porcentaje" : "Percent")}
                    </button>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={aspect} onChange={(e) => setAspect(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                <span className="text-sm text-foreground">Aspect</span>
              </label>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-medium text-foreground mb-2">
                {locale === "es" ? "Formato vectorial" : "Vector format"}
              </p>
              <div className="flex gap-2">
                {["shp", "kmz", "geojson"].map((fmt) => (
                  <button key={fmt} onClick={() => setFormatoVectorial(fmt)}
                    className={`rounded px-2 py-1 text-xs font-medium uppercase transition-colors ${formatoVectorial === fmt ? "bg-accent text-accent-foreground" : "border border-border text-muted-foreground"}`}>
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón procesar */}
          <button
            onClick={handleSubmit}
            disabled={estado === "procesando" || (!geojson && !archivo)}
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {estado === "procesando" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {locale === "es" ? "Procesando..." : "Processing..."}
              </span>
            ) : locale === "es" ? "Procesar área" : "Process area"}
          </button>

          {/* Resultado */}
          {estado === "listo" && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <CheckCircle className="mx-auto h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm font-medium text-foreground mb-3">
                {locale === "es" ? "Proceso completado" : "Process completed"}
              </p>
              <a href={urlDescarga} download="resultado_dem.zip"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">
                <Download className="h-3.5 w-3.5" />
                {locale === "es" ? "Descargar ZIP" : "Download ZIP"}
              </a>
              <div className="mt-3 border-t border-green-500/20 pt-3">
                <p className="text-xs text-muted-foreground mb-2">{locale === "es" ? "¿Te fue útil?" : "Was this useful?"}</p>
                <a href="https://ko-fi.com/plannova01" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  ☕ {locale === "es" ? "Invítame un café (USD)" : "Buy me a coffee (USD)"}
                </a>
              </div>
            </div>
          )}

          {estado === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">{mensajeError}</p>
              <button onClick={() => setEstado("idle")} className="mt-2 text-xs text-accent underline">
                {locale === "es" ? "Intentar de nuevo" : "Try again"}
              </button>
            </div>
          )}
        </div>

        {/* Panel derecho — mapa */}
        <div className="lg:col-span-2">
          {modoEntrada === "archivo" ? (
            <div className="rounded-xl border border-border bg-card/50 h-96 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">
                {locale === "es" ? "Sube tu archivo en el panel izquierdo" : "Upload your file on the left panel"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden relative">
              {geojson && (
                <button
                  onClick={limpiarMapa}
                  className="absolute top-3 right-3 z-[1000] flex items-center gap-1 rounded-lg bg-background/90 backdrop-blur px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border"
                >
                  <Trash2 className="h-3 w-3" />
                  {locale === "es" ? "Limpiar" : "Clear"}
                </button>
              )}
              <div ref={mapRef} className="h-[500px] w-full" />
              {!geojson && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] rounded-lg bg-background/90 backdrop-blur px-3 py-2 text-xs text-muted-foreground border border-border pointer-events-none">
                  {modoEntrada === "mapa-poligono"
                    ? (locale === "es" ? "Usa la herramienta de polígono para dibujar tu área" : "Use the polygon tool to draw your area")
                    : (locale === "es" ? "Usa la herramienta de rectángulo para seleccionar tu área" : "Use the rectangle tool to select your area")}
                </div>
              )}
            </div>
          )}
          
          {geojson && (
            <p className="mt-2 text-xs text-green-500 text-center">
              ✓ {locale === "es" ? "Área definida — listo para procesar" : "Area defined — ready to process"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
