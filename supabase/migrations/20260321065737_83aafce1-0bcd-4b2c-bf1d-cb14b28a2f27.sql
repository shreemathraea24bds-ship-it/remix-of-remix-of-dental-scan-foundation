
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS screenshot_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payments', 'payments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own payment screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can read payment screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payments');
