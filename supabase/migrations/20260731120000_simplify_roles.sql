-- 1. Add the role column to public.profiles
ALTER TABLE public.profiles ADD COLUMN role public.app_role NOT NULL DEFAULT 'citizen';

-- 2. Migrate existing roles from user_roles
UPDATE public.profiles p
SET role = (
  SELECT role 
  FROM public.user_roles ur 
  WHERE ur.user_id = p.id 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 
  FROM public.user_roles ur 
  WHERE ur.user_id = p.id
);

-- 3. Drop user_roles table and its policies
DROP TABLE IF EXISTS public.user_roles;

-- 4. Update get_auth_role function to use profiles
CREATE OR REPLACE FUNCTION public.get_auth_role(_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- 5. Update has_role function to use profiles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role);
$$;

-- 6. Update is_authority function to use profiles
CREATE OR REPLACE FUNCTION public.is_authority(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role IN ('police','dmb','city_corp'));
$$;

-- 7. Update handle_new_user trigger to NOT insert into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, emergency_contact_name, emergency_contact_phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'emergency_contact_name',
    NEW.raw_user_meta_data->>'emergency_contact_phone',
    'citizen'
  );
  RETURN NEW;
END; $$;
