-- ============ Tabla servicios ============
CREATE TABLE public.servicios (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL DEFAULT 0,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.servicios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicios TO authenticated;
GRANT ALL ON public.servicios TO service_role;

ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Servicios es de lectura publica"
  ON public.servicios FOR SELECT
  USING (true);

CREATE POLICY "Solo admin puede insertar en servicios"
  ON public.servicios FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin puede actualizar servicios"
  ON public.servicios FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin puede borrar servicios"
  ON public.servicios FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ Tabla proyectos ============
CREATE TABLE public.proyectos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo text NOT NULL,
  descripcion text,
  imagen_url text,
  tecnologias text[] NOT NULL DEFAULT '{}',
  orden integer NOT NULL DEFAULT 0,
  fecha_creacion timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.proyectos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proyectos TO authenticated;
GRANT ALL ON public.proyectos TO service_role;

ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proyectos es de lectura publica"
  ON public.proyectos FOR SELECT
  USING (true);

CREATE POLICY "Solo admin puede insertar en proyectos"
  ON public.proyectos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin puede actualizar proyectos"
  ON public.proyectos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin puede borrar proyectos"
  ON public.proyectos FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ Storage policies: proyectos_imagenes ============
CREATE POLICY "Imagenes de proyectos lectura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'proyectos_imagenes');

CREATE POLICY "Solo admin sube imagenes de proyectos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proyectos_imagenes' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin actualiza imagenes de proyectos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'proyectos_imagenes' AND has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'proyectos_imagenes' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Solo admin borra imagenes de proyectos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'proyectos_imagenes' AND has_role(auth.uid(), 'admin'::app_role));