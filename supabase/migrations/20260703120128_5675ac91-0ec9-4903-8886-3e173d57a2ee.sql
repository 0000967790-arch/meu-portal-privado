
ALTER TABLE public.partners
  ADD COLUMN hours TEXT,
  ADD COLUMN services TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN benefit TEXT;
