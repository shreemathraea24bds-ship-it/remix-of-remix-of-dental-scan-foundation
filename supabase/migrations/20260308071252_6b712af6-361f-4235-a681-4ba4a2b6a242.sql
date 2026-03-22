
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('dentist', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Patient scans table
CREATE TABLE public.patient_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL DEFAULT 'Anonymous',
  scan_type TEXT NOT NULL DEFAULT 'General Scan',
  urgency TEXT NOT NULL DEFAULT 'green' CHECK (urgency IN ('red', 'amber', 'green')),
  image_url TEXT,
  ai_analysis JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'referred')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.patient_scans ENABLE ROW LEVEL SECURITY;

-- Patients can see own scans
CREATE POLICY "Patients can read own scans"
  ON public.patient_scans FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

-- Patients can insert own scans
CREATE POLICY "Patients can insert own scans"
  ON public.patient_scans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- Dentists can read all scans
CREATE POLICY "Dentists can read all scans"
  ON public.patient_scans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));

-- Dentists can update scans (review, notes)
CREATE POLICY "Dentists can update scans"
  ON public.patient_scans FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));

-- Dentists can read all profiles (for patient names)
CREATE POLICY "Dentists can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dentist'));
