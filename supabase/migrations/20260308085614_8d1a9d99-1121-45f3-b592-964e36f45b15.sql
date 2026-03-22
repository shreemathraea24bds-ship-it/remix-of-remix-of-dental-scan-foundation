
-- Lesion tracking table for persistent 14-day protocol
CREATE TABLE public.lesion_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  lesion_id UUID NOT NULL DEFAULT gen_random_uuid(),
  entry_day INT NOT NULL CHECK (entry_day BETWEEN 1 AND 14),
  size_mm FLOAT NOT NULL,
  size_delta TEXT,
  status TEXT NOT NULL DEFAULT 'unchanged' CHECK (status IN ('shrinking', 'unchanged', 'growing')),
  color_score FLOAT DEFAULT 50,
  image_url TEXT,
  notes TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesion_id, entry_day)
);

-- Enable RLS
ALTER TABLE public.lesion_entries ENABLE ROW LEVEL SECURITY;

-- Patients can read own entries
CREATE POLICY "Patients can read own lesion entries"
ON public.lesion_entries FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Patients can insert own entries
CREATE POLICY "Patients can insert own lesion entries"
ON public.lesion_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- Patients can update own entries
CREATE POLICY "Patients can update own lesion entries"
ON public.lesion_entries FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id);

-- Dentists can read all entries
CREATE POLICY "Dentists can read all lesion entries"
ON public.lesion_entries FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'dentist'));
