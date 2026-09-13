import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Planispherium Nova" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 sm:py-32">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Política de Privacidad
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última actualización: julio de 2026
      </p>

      <div className="mt-10 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Información que recopilamos</h2>
          <p>Planispherium Nova no recopila ni almacena datos personales de los visitantes. Los archivos que subes para procesamiento (PDF, Excel, GeoJSON, KML, KMZ, SHP) se procesan temporalmente y se eliminan automáticamente dentro de la hora siguiente a su procesamiento.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Uso de los archivos</h2>
          <p>Los archivos subidos se utilizan exclusivamente para generar el resultado solicitado (recorte DEM, oficio técnico, u otros). No se comparten con terceros ni se utilizan para ningún otro propósito.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Cookies</h2>
          <p>Este sitio no utiliza cookies de seguimiento ni de publicidad. Solo se utilizan las cookies técnicas estrictamente necesarias para el funcionamiento del sitio.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Servicios de terceros</h2>
          <p>El sitio utiliza Ko-fi para donaciones voluntarias. Las transacciones son procesadas por Stripe. Planispherium Nova no tiene acceso a los datos de pago — estos son gestionados directamente por Ko-fi y Stripe conforme a sus propias políticas de privacidad.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Redes sociales y publicidad</h2>
          <p>Planispherium Nova puede publicar contenido en redes sociales de forma automatizada. Esta publicación incluye únicamente imágenes y descripciones de productos disponibles públicamente. No se recopilan ni procesan datos personales de usuarios de dichas plataformas.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Contacto</h2>
          <p>Para cualquier consulta sobre esta política, puedes escribirnos a través del <a href="/contacto" className="text-accent hover:underline">formulario de contacto</a>.</p>
        </div>
      </div>
    </section>
  );
}
