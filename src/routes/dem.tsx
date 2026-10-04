import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Globe, Upload, Square, PenLine, Trash2,
  Loader2, Download, CheckCircle, AlertCircle,
  Zap, Star,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dem")({
  head: () => ({
    meta: [
      { title: "Recorte DEM — Planispherium Nova" },
      { name: "description", content: "Recorte DEM con curvas de nivel y derivados. Dibuja tu área en el mapa o sube tu archivo." },
    ],
    links: [
      { rel: "canonical", href: "/dem" },
      { rel: "stylesheet", href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" },
      { rel: "stylesheet", href: "/vendor/leaflet.draw.css" },
    ],
  }),
  component: DemPage,
});

type ModoEntrada = "mapa-poligono" | "mapa-rectangulo" | "archivo";
type Estado = "idle" | "verificando" | "procesando" | "listo" | "error";
type ResolucionPlan = "15m" | "5m";

interface Coverage {
  in_mexico: boolean;
  coverage_pct: number;
  cem_available: boolean;
  worlddem_available: boolean;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function DemPage() {
  const { locale } = useLanguage();
  const [modoEntrada, setModoEntrada] = useState<ModoEntrada>("mapa-poligono");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [geojson, setGeojson] = useState<object | null>(null);
  const [coverage, setCoverage] = useState<Coverage | null>(null);
  const [plan, setPlan] = useState<ResolucionPlan>("15m");
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
  const [mapaListo, setMapaListo] = useState(false);

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
const pagoStatus = params.get("pago");
const sessionId = params.get("session_id");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const activeHandlerRef = useRef<any>(null);

  const checkCoverage = useCallback(async (gj: object) => {
    setEstado("verificando");
    try {
      const resp = await fetch("https://plannova.com.mx/api/dem/check-coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gj),
      });
      const data = await resp.json();
      setCoverage(data);
      if (!data.cem_available) setPlan("5m");
      else setPlan("15m");
    } catch {
      setCoverage(null);
    }
    setEstado("idle");
  }, []);

  // Activar herramienta de dibujo programáticamente
  const activarHerramienta = useCallback((modo: ModoEntrada) => {
    const map = mapInstanceRef.current;
    const L = LRef.current;
    const drawnItems = drawnItemsRef.current;
    if (!map || !L || !drawnItems) return;

    // Cancelar handler activo si existe
    if (activeHandlerRef.current) {
      try { activeHandlerRef.current.disable(); } catch {}
      activeHandlerRef.current = null;
    }

    // Quitar control anterior
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (modo === "archivo") return;

    // Crear nuevo control con solo la herramienta correcta
    const LDraw = L as any;
    const drawControl = new LDraw.Control.Draw({
      edit: false,
      draw: {
        polygon: modo === "mapa-poligono" ? { allowIntersection: false } : false,
        rectangle: modo === "mapa-rectangulo" ? {} : false,
        polyline: false, circle: false, circlemarker: false, marker: false,
      },
    });
    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Activar la herramienta automáticamente
    setTimeout(() => {
      const LDraw2 = L as any;
      let handler: any;
      if (modo === "mapa-poligono") {
        handler = new LDraw2.Draw.Polygon(map, { allowIntersection: false });
      } else if (modo === "mapa-rectangulo") {
        handler = new LDraw2.Draw.Rectangle(map, {});
      }
      if (handler) {
        handler.enable();
        activeHandlerRef.current = handler;
      }
    }, 100);
  }, []);

  // Inicializar mapa UNA SOLA VEZ
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await loadScript("/vendor/leaflet.draw.js");
      LRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: [23.5, -102], zoom: 5 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;
      mapInstanceRef.current = map;

      const LDraw = L as any;
      map.on(LDraw.Draw.Event.CREATED, (e: any) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
        const gj = drawnItems.toGeoJSON();
        setGeojson(gj);
        setCoverage(null);
        checkCoverage(gj);
        // Re-activar herramienta para permitir redibujar
        setModoEntrada(prev => { activarHerramienta(prev); return prev; });
      });

      setMapaListo(true);
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        LRef.current = null;
        drawnItemsRef.current = null;
        drawControlRef.current = null;
        activeHandlerRef.current = null;
        setMapaListo(false);
      }
    };
  }, [checkCoverage, activarHerramienta]);

  // Cuando cambia el modo Y el mapa ya está listo: actualizar herramienta sin recrear mapa
  useEffect(() => {
    if (!mapaListo) return;
    if (modoEntrada === "archivo") {
      if (drawControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      if (activeHandlerRef.current) {
        try { activeHandlerRef.current.disable(); } catch {}
        activeHandlerRef.current = null;
      }
      return;
    }
    activarHerramienta(modoEntrada);
  }, [modoEntrada, mapaListo, activarHerramienta]);

  const limpiarMapa = () => {
    drawnItemsRef.current?.clearLayers();
    setGeojson(null);
    setCoverage(null);
    activarHerramienta(modoEntrada);
  };

  const handleSubmit = async () => {
    if (!geojson && !archivo) {
      setMensajeError(locale === "es" ? "Dibuja o sube un área primero." : "Draw or upload an area first.");
      setEstado("error");
      return;
    }
    if (plan === "5m") {
  setMensajeError(locale === "es" ? "El servicio premium estará disponible próximamente." : "Premium service coming soon.");
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
      const response = await fetch("https://plannova.com.mx/api/dem/procesar", { method: "POST", body: formData });
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
            {pagoStatus === "exitoso" && sessionId && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-3" />
          <p className="text-lg font-semibold text-foreground mb-2">
            {locale === "es" ? "¡Pago exitoso!" : "Payment successful!"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {locale === "es" ? "Tu DEM 5m está siendo procesado." : "Your 5m DEM is being processed."}
          </p>
          <a href={`https://plannova.com.mx/api/dem/resultado/${sessionId}`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
            <Download className="h-4 w-4" />
            {locale === "es" ? "Descargar DEM 5m" : "Download 5m DEM"}
          </a>
        </div>
      )}

      {pagoStatus === "cancelado" && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-2" />
          <p className="text-sm text-muted-foreground">
            {locale === "es" ? "Pago cancelado. Puedes intentarlo de nuevo." : "Payment cancelled. You can try again."}
          </p>
        </div>
      )}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
          <Globe className="h-3.5 w-3.5 text-accent" />
          {locale === "es" ? "Cobertura México y mundial" : "Mexico and worldwide coverage"}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {locale === "es" ? "Recorte DEM con curvas de nivel y derivados" : "DEM clip with contour lines and derivatives"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {locale === "es"
            ? "Define tu área en el mapa. El sistema detecta automáticamente qué productos están disponibles."
            : "Define your area on the map. The system automatically detects what products are available."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              {locale === "es" ? "Herramienta de dibujo" : "Drawing tool"}
            </p>
            <div className="space-y-2">
              {[
                { id: "mapa-poligono", icon: PenLine, label: locale === "es" ? "Dibujar polígono" : "Draw polygon" },
                { id: "mapa-rectangulo", icon: Square, label: locale === "es" ? "Trazar rectángulo" : "Draw rectangle" },
                { id: "archivo", icon: Upload, label: locale === "es" ? "Subir archivo" : "Upload file" },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id}
                  onClick={() => { setModoEntrada(id as ModoEntrada); setGeojson(null); setArchivo(null); setCoverage(null); }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${modoEntrada === id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"}`}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {modoEntrada === "archivo" && (
            <div className="rounded-xl border border-border bg-card p-4">
              <label className="flex flex-col items-center gap-2 cursor-pointer text-center">
                <Upload className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {archivo ? archivo.name : locale === "es" ? "Seleccionar archivo" : "Select file"}
                </span>
                <span className="text-xs text-muted-foreground">SHP·ZIP, KML, KMZ, GeoJSON</span>
                <input type="file" accept=".zip,.kml,.kmz,.geojson" className="hidden"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}

          {estado === "verificando" && (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent mb-2" />
              <p className="text-xs text-muted-foreground">
                {locale === "es" ? "Verificando cobertura..." : "Checking coverage..."}
              </p>
            </div>
          )}

          {coverage && estado !== "verificando" && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium text-foreground mb-3">
                {locale === "es" ? "Planes disponibles" : "Available plans"}
              </p>
              onClick={handleSubmit} disabled={!coverage.cem_available || !geojson || estado === "procesando"}
                className={`w-full rounded-lg border p-3 text-left transition-colors mb-2 ${!coverage.cem_available ? "border-border opacity-40 cursor-not-allowed" : "border-accent bg-accent/10 hover:bg-accent/20 cursor-pointer"}`}
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Zap className="h-3.5 w-3.5 text-accent" />
                    {locale === "es" ? "Resolución 15m" : "15m Resolution"}
                  </span>
                  <span className="text-xs font-semibold text-green-500">{locale === "es" ? "Gratis" : "Free"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{locale === "es" ? "CEM INEGI — Solo México" : "CEM INEGI — Mexico only"}</p>
                {!coverage.cem_available && (
                  <p className="text-xs text-red-400 mt-1">{locale === "es" ? "No disponible fuera de México" : "Not available outside Mexico"}</p>
                )}
              </button>

              <button onClick={async () => {
  if (!geojson) return;
  setEstado("procesando");
  try {
    const resp = await fetch("https://plannova.com.mx/api/dem/crear-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geojson),
    });
    const data = await resp.json();
    if (data.url) window.location.href = data.url;
  } catch {
    setMensajeError("Error al crear sesión de pago.");
    setEstado("error");
  }
}}
disabled={!geojson}
className={`w-full rounded-lg border p-3 text-left transition-colors ${!geojson ? "border-border opacity-40 cursor-not-allowed" : "border-yellow-500/50 hover:border-yellow-500 cursor-pointer"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    {locale === "es" ? "Resolución 5m" : "5m Resolution"}
                  </span>
                  <span className="text-xs font-semibold text-yellow-500">Premium</span>
                </div>
                <p className="text-xs text-muted-foreground">WorldDEM Neo — {locale === "es" ? "Cobertura global" : "Global coverage"}</p>
                </button>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">{locale === "es" ? "Productos" : "Products"}</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={curvas} onChange={(e) => setCurvas(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                <span className="text-sm text-foreground">{locale === "es" ? "Curvas de nivel" : "Contour lines"}</span>
              </label>
              {curvas && (
                <div className="ml-5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{locale === "es" ? "Equidistancia (m):" : "Interval (m):"}</span>
                  <input type="number" min={1} max={10000} value={equidistancia}
                    onChange={(e) => setEquidistancia(e.target.value)}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground" />
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
              <p className="text-xs font-medium text-foreground mb-2">{locale === "es" ? "Formato vectorial" : "Vector format"}</p>
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

          

          {estado === "listo" && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
              <CheckCircle className="mx-auto h-6 w-6 text-green-500 mb-2" />
              <p className="text-sm font-medium text-foreground mb-3">{locale === "es" ? "Proceso completado" : "Process completed"}</p>
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

        <div className="lg:col-span-2">
          <div className={modoEntrada === "archivo" ? "hidden" : ""}>
            <div className="rounded-xl border border-border overflow-hidden relative">
                            {(geojson || true ) && (
                <button onClick={limpiarMapa}
                  className="absolute top-3 right-3 z-[1000] flex items-center gap-1 rounded-lg bg-background/90 backdrop-blur px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border">
                  <Trash2 className="h-3 w-3" />
                  {locale === "es" ? "Limpiar" : "Clear"}
                </button>
              )}
              <div ref={mapRef} className="h-[500px] w-full" />
              {!geojson && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] rounded-lg bg-background/90 backdrop-blur px-3 py-2 text-xs text-muted-foreground border border-border pointer-events-none">
                  {modoEntrada === "mapa-poligono"
                    ? (locale === "es" ? "Haz clic en el mapa para dibujar tu polígono" : "Click on the map to draw your polygon")
                    : (locale === "es" ? "Haz clic y arrastra para trazar tu rectángulo" : "Click and drag to draw your rectangle")}
                </div>
              )}
            </div>
            {coverage && (
              <p className={`mt-2 text-xs text-center ${coverage.in_mexico ? "text-green-500" : "text-yellow-500"}`}>
                {coverage.in_mexico
                  ? (locale === "es" ? `✓ Área en México (${coverage.coverage_pct}% cobertura CEM)` : `✓ Area in Mexico (${coverage.coverage_pct}% CEM coverage)`)
                  : (locale === "es" ? "⚠ Área fuera de México — solo disponible WorldDEM 5m premium" : "⚠ Area outside Mexico — only WorldDEM 5m premium available")}
              </p>
            )}
          </div>

          {modoEntrada === "archivo" && (
            <div className="rounded-xl border border-border bg-card/50 h-96 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  {locale === "es" ? "Sube tu archivo en el panel izquierdo" : "Upload your file on the left panel"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
