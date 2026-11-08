-- Drop old overly permissive policies
DROP POLICY IF EXISTS "reports public read" ON public.reports;
DROP POLICY IF EXISTS "reports authority update" ON public.reports;

-- Helper to quickly get the role of a user
CREATE OR REPLACE FUNCTION public.get_auth_role(_user_id UUID)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- Allow anonymous users to view all reports (for the public map)
CREATE POLICY "reports anon read" ON public.reports FOR SELECT TO anon USING (true);

-- Strict Read Policy for authenticated users
CREATE POLICY "reports read access" ON public.reports FOR SELECT TO authenticated USING (
  -- Citizens (non-authorities) see all
  NOT public.is_authority(auth.uid())
  OR
  -- City Corp sees all
  public.get_auth_role(auth.uid()) = 'city_corp'
  OR
  -- Police sees crime
  (public.get_auth_role(auth.uid()) = 'police' AND type = 'crime')
  OR
  -- DMB sees accident and specific infra
  (
    public.get_auth_role(auth.uid()) = 'dmb' AND (
      type = 'accident' OR 
      (type = 'infrastructure' AND subtype IN ('fire', 'building', 'waterlogging', 'road_accident', 'other_accident'))
    )
  )
);

-- Strict Update Policy for authorities
CREATE POLICY "reports authority update strict" ON public.reports FOR UPDATE TO authenticated USING (
  public.get_auth_role(auth.uid()) = 'city_corp'
  OR
  (public.get_auth_role(auth.uid()) = 'police' AND type = 'crime')
  OR
  (
    public.get_auth_role(auth.uid()) = 'dmb' AND (
      type = 'accident' OR 
      (type = 'infrastructure' AND subtype IN ('fire', 'building', 'waterlogging', 'road_accident', 'other_accident'))
    )
  )
) WITH CHECK (
  public.get_auth_role(auth.uid()) = 'city_corp'
  OR
  (public.get_auth_role(auth.uid()) = 'police' AND type = 'crime')
  OR
  (
    public.get_auth_role(auth.uid()) = 'dmb' AND (
      type = 'accident' OR 
      (type = 'infrastructure' AND subtype IN ('fire', 'building', 'waterlogging', 'road_accident', 'other_accident'))
    )
  )
);
