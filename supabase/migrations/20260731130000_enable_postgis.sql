-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Add Geometry column to reports
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS location extensions.geometry(Point, 4326);

-- 3. Backfill existing reports
UPDATE public.reports
SET location = extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- 4. Create an index for fast spatial queries
CREATE INDEX IF NOT EXISTS reports_location_idx ON public.reports USING GIST (location);

-- 5. Create a trigger to automatically update location when lat/lng change
CREATE OR REPLACE FUNCTION public.sync_report_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location := extensions.st_setsrid(extensions.st_makepoint(NEW.lng, NEW.lat), 4326);
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_report_location ON public.reports;
CREATE TRIGGER trg_sync_report_location
BEFORE INSERT OR UPDATE OF lat, lng ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.sync_report_location();
