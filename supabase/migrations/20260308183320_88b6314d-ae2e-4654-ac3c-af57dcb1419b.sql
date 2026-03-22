
-- Guardian Protocol: Lockdown tracking table
CREATE TABLE public.guardian_lockdowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  device_id TEXT NOT NULL DEFAULT 'all',
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  is_active BOOLEAN NOT NULL DEFAULT true,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovery_hash TEXT
);

ALTER TABLE public.guardian_lockdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can read own lockdowns"
  ON public.guardian_lockdowns FOR SELECT
  TO authenticated
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert own lockdowns"
  ON public.guardian_lockdowns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own lockdowns"
  ON public.guardian_lockdowns FOR UPDATE
  TO authenticated
  USING (auth.uid() = doctor_id);

-- Enable realtime for instant remote wipe
ALTER PUBLICATION supabase_realtime ADD TABLE public.guardian_lockdowns;
