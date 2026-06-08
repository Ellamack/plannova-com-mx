-- Tabla galeria
CREATE TABLE public.galeria (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.galeria TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.galeria TO authenticated;
GRANT ALL ON public.galeria TO service_role;

ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Galeria es de lectura publica"
  ON public.galeria FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar en galeria"
  ON public.galeria FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar galeria"
  ON public.galeria FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden borrar galeria"
  ON public.galeria FOR DELETE TO authenticated
  USING (true);

-- Tabla capas
CREATE TABLE public.capas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  archivo_url TEXT,
  tipo TEXT NOT NULL DEFAULT 'otros' CHECK (tipo IN ('Shapefile', 'GeoJSON', 'KML', 'TIFF', 'otros')),
  tamano TEXT,
  fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.capas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capas TO authenticated;
GRANT ALL ON public.capas TO service_role;

ALTER TABLE public.capas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capas es de lectura publica"
  ON public.capas FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar en capas"
  ON public.capas FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar capas"
  ON public.capas FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden borrar capas"
  ON public.capas FOR DELETE TO authenticated
  USING (true);