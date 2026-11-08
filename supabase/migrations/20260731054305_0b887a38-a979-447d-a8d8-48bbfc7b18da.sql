-- hotspots read only publicly-readable reports; no elevated privileges needed
CREATE OR REPLACE FUNCTION public.crime_hotspots()
RETURNS TABLE (lat DOUBLE PRECISION, lng DOUBLE PRECISION, report_count BIGINT)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT AVG(b.lat)::double precision, AVG(b.lng)::double precision, COUNT(*)::bigint
  FROM public.reports a
  JOIN public.reports b
    ON b.type = 'crime'
   AND b.created_at > now() - interval '48 hours'
   AND ABS(a.lat - b.lat) < 0.0054
   AND ABS(a.lng - b.lng) < 0.0054
  WHERE a.type = 'crime' AND a.created_at > now() - interval '48 hours'
  GROUP BY a.id
  HAVING COUNT(*) >= 3;
$$;

-- internal trigger functions: not callable from the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- role helpers: only signed-in users (needed by RLS policies)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_authority(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_authority(uuid) TO authenticated;