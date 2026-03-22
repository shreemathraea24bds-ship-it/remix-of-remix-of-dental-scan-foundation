
-- Family links table: pairs parent and child accounts
CREATE TABLE public.family_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  link_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

-- Parents can see their own links
CREATE POLICY "Parents can read own links"
  ON public.family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

-- Children can see their own links
CREATE POLICY "Children can read own links"
  ON public.family_links FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

-- Parents can create links (claim a child by code)
CREATE POLICY "Parents can insert links"
  ON public.family_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = parent_id);

-- Battle events table: records battles and milestones for realtime sync
CREATE TABLE public.battle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL DEFAULT 'battle_complete',
  hunter_name text NOT NULL DEFAULT 'Hunter',
  monsters_defeated integer NOT NULL DEFAULT 0,
  total_monsters integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  loot_collected text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.battle_events ENABLE ROW LEVEL SECURITY;

-- Children can insert their own events
CREATE POLICY "Children can insert own events"
  ON public.battle_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

-- Children can read own events
CREATE POLICY "Children can read own events"
  ON public.battle_events FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

-- Parents can read events from their linked children
CREATE POLICY "Parents can read linked children events"
  ON public.battle_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_links
      WHERE family_links.parent_id = auth.uid()
        AND family_links.child_id = battle_events.child_id
        AND family_links.status = 'active'
    )
  );

-- Pairing codes table: child generates a code, parent claims it
CREATE TABLE public.pairing_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  hunter_name text NOT NULL DEFAULT 'Hunter',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;

-- Children can manage their own pairing codes
CREATE POLICY "Children can insert own codes"
  ON public.pairing_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = child_id);

CREATE POLICY "Children can read own codes"
  ON public.pairing_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = child_id);

CREATE POLICY "Children can update own codes"
  ON public.pairing_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = child_id);

-- Anyone authenticated can read codes (to claim them)
CREATE POLICY "Anyone can read unclaimed codes"
  ON public.pairing_codes FOR SELECT
  TO authenticated
  USING (claimed = false AND expires_at > now());

-- Enable realtime on battle_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_events;
