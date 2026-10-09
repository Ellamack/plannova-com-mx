ALTER TABLE public.galeria ADD COLUMN IF NOT EXISTS etsy_url text;

COMMENT ON COLUMN public.galeria.etsy_url IS 'Optional external Etsy shop link shown on the gallery detail dialog.';