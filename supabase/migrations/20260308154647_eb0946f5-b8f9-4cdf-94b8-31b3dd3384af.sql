
-- Create tongue analysis history table
CREATE TABLE public.tongue_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT,
  estimated_ph DOUBLE PRECISION NOT NULL DEFAULT 7.0,
  ph_range TEXT NOT NULL DEFAULT 'neutral',
  confidence INTEGER NOT NULL DEFAULT 0,
  tongue_defects JSONB DEFAULT '[]'::jsonb,
  diseases JSONB DEFAULT '[]'::jsonb,
  vitamin_deficiencies JSONB DEFAULT '[]'::jsonb,
  recovery JSONB DEFAULT '[]'::jsonb,
  tongue_analysis JSONB DEFAULT '{}'::jsonb,
  summary TEXT DEFAULT '',
  symptoms TEXT[] DEFAULT '{}',
  dietary_log TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tongue_analyses ENABLE ROW LEVEL SECURITY;

-- Users can read own analyses
CREATE POLICY "Users can read own tongue analyses"
  ON public.tongue_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert own analyses
CREATE POLICY "Users can insert own tongue analyses"
  ON public.tongue_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own analyses
CREATE POLICY "Users can delete own tongue analyses"
  ON public.tongue_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for tongue photos
INSERT INTO storage.buckets (id, name, public) VALUES ('tongue-photos', 'tongue-photos', true);

-- Storage policies
CREATE POLICY "Users can upload own tongue photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tongue-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view tongue photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tongue-photos');

CREATE POLICY "Users can delete own tongue photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'tongue-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
