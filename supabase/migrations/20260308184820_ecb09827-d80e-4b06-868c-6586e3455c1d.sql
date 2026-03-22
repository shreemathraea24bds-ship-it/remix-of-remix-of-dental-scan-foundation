
-- Consultation requests table
CREATE TABLE public.consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  patient_name text NOT NULL DEFAULT 'Anonymous',
  doctor_id uuid,
  scan_id uuid REFERENCES public.patient_scans(id),
  status text NOT NULL DEFAULT 'pending',
  message text,
  contact_phone text,
  preferred_mode text NOT NULL DEFAULT 'video',
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  jitsi_room text
);

ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- Patients can insert their own requests
CREATE POLICY "Patients can insert own requests"
  ON public.consultation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Patients can read own requests
CREATE POLICY "Patients can read own requests"
  ON public.consultation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- Patients can update own pending requests
CREATE POLICY "Patients can update own requests"
  ON public.consultation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id AND status = 'pending');

-- Dentists can read all requests
CREATE POLICY "Dentists can read all requests"
  ON public.consultation_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));

-- Dentists can update requests (accept/decline)
CREATE POLICY "Dentists can update requests"
  ON public.consultation_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_requests;
