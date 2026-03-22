
ALTER TABLE public.profiles ADD COLUMN consultation_fee integer NOT NULL DEFAULT 100;

CREATE TABLE public.consultation_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultation_requests(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  amount integer NOT NULL,
  upi_transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz
);

ALTER TABLE public.consultation_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can insert own payments"
  ON public.consultation_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can read own payments"
  ON public.consultation_payments FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can read all payments"
  ON public.consultation_payments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'dentist'));

CREATE POLICY "Dentists can update payments"
  ON public.consultation_payments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'dentist'));

ALTER TABLE public.consultation_requests ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid';
