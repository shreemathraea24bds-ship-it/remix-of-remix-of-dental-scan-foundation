
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, upi_id, consultation_fee)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'signup_role', 'patient'),
    NEW.raw_user_meta_data->>'upi_id',
    COALESCE((NEW.raw_user_meta_data->>'consultation_fee')::integer, 100)
  );

  IF NEW.raw_user_meta_data->>'signup_role' = 'dentist' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'dentist');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'patient');
  END IF;

  RETURN NEW;
END;
$$;
