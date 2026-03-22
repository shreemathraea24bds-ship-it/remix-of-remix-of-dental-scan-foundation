
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'signup_role', 'patient')
  );

  -- If dentist, also insert into user_roles
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
