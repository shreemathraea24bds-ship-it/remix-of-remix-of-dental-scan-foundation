
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL DEFAULT 'pro',
  status text NOT NULL DEFAULT 'active',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  notes text,
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'dentist'::app_role))
  WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));
