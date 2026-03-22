
-- Payment receipts table
CREATE TABLE public.payment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  payment_date text NOT NULL DEFAULT '',
  payment_time text NOT NULL DEFAULT '',
  amount text NOT NULL DEFAULT '',
  reference_id text NOT NULL DEFAULT '',
  transaction_id text NOT NULL DEFAULT '',
  image_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own receipts" ON public.payment_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own receipts" ON public.payment_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Dentists can read all receipts" ON public.payment_receipts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'dentist'));

CREATE POLICY "Dentists can update receipts" ON public.payment_receipts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'dentist'));

-- Storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public) VALUES ('receipt-uploads', 'receipt-uploads', true);

CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipt-uploads');

CREATE POLICY "Anyone can view receipts"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'receipt-uploads');
