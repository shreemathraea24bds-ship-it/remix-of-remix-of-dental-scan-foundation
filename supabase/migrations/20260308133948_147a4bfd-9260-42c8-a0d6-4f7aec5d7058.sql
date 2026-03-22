
CREATE TABLE public.payment_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  upi_transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

ALTER TABLE public.payment_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own claims"
  ON public.payment_claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own claims"
  ON public.payment_claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Dentists can read all claims"
  ON public.payment_claims FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "Dentists can update claims"
  ON public.payment_claims FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'dentist'::app_role));
