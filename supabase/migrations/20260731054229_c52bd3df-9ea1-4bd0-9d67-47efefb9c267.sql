-- ENUMS
CREATE TYPE public.app_role AS ENUM ('citizen','police','dmb','city_corp');
CREATE TYPE public.report_type AS ENUM ('crime','infrastructure','accident');
CREATE TYPE public.report_status AS ENUM ('sent','received','resolved');
CREATE TYPE public.vote_kind AS ENUM ('confirm','dispute');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES (separate table, never on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_authority(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('police','dmb','city_corp'));
$$;

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, emergency_contact_name, emergency_contact_phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'emergency_contact_name',
    NEW.raw_user_meta_data->>'emergency_contact_phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- REPORTS
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type public.report_type NOT NULL,
  subtype TEXT,
  photo_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  area_name TEXT,
  status public.report_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports public read" ON public.reports FOR SELECT USING (true);
CREATE POLICY "reports insert own" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports update own" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = reporter_id) WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports delete own" ON public.reports FOR DELETE TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "reports authority update" ON public.reports FOR UPDATE TO authenticated USING (public.is_authority(auth.uid())) WITH CHECK (public.is_authority(auth.uid()));
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX reports_created_idx ON public.reports (created_at DESC);
CREATE INDEX reports_type_idx ON public.reports (type);

-- VOTES
CREATE TABLE public.report_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote public.vote_kind NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);
GRANT SELECT ON public.report_votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_votes TO authenticated;
GRANT ALL ON public.report_votes TO service_role;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes public read" ON public.report_votes FOR SELECT USING (true);
CREATE POLICY "votes manage own" ON public.report_votes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- POLICE STATIONS
CREATE TABLE public.police_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.police_stations TO anon;
GRANT SELECT ON public.police_stations TO authenticated;
GRANT ALL ON public.police_stations TO service_role;
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stations public read" ON public.police_stations FOR SELECT USING (true);

-- HOSPITALS
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  beds_available INTEGER NOT NULL DEFAULT 0,
  icu_available INTEGER NOT NULL DEFAULT 0,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hospitals TO anon;
GRANT SELECT ON public.hospitals TO authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hospitals public read" ON public.hospitals FOR SELECT USING (true);

-- SOS ALERTS
CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  nearest_station_id UUID REFERENCES public.police_stations(id) ON DELETE SET NULL,
  contact_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.sos_alerts TO authenticated;
GRANT ALL ON public.sos_alerts TO service_role;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos own read" ON public.sos_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sos authority read" ON public.sos_alerts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'city_corp'));
CREATE POLICY "sos insert own" ON public.sos_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sos update own" ON public.sos_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sos authority update" ON public.sos_alerts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'city_corp')) WITH CHECK (public.has_role(auth.uid(),'police') OR public.has_role(auth.uid(),'city_corp'));
CREATE TRIGGER sos_updated_at BEFORE UPDATE ON public.sos_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- HOTSPOT DETECTION: 3+ crime reports within ~600m in the last 48 hours
CREATE OR REPLACE FUNCTION public.crime_hotspots()
RETURNS TABLE (lat DOUBLE PRECISION, lng DOUBLE PRECISION, report_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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

-- SEED: police stations (Dhaka)
INSERT INTO public.police_stations (name, lat, lng, phone) VALUES
('Gulshan Thana', 23.7925, 90.4078, '+8801713373188'),
('Dhanmondi Thana', 23.7465, 90.3760, '+8801713373135'),
('Mirpur Model Thana', 23.8060, 90.3685, '+8801713373147'),
('Motijheel Thana', 23.7330, 90.4172, '+8801713373125'),
('Uttara West Thana', 23.8697, 90.3790, '+8801713373155'),
('Tejgaon Thana', 23.7639, 90.3960, '+8801713373140'),
('Ramna Thana', 23.7387, 90.3985, '+8801713373130');

-- SEED: hospitals (Dhaka)
INSERT INTO public.hospitals (name, lat, lng, beds_available, icu_available, phone) VALUES
('Square Hospitals Ltd, Panthapath', 23.7524, 90.3846, 12, 3, '+880255013000'),
('Dhaka Medical College Hospital', 23.7256, 90.3975, 0, 0, '+88028626812'),
('United Hospital, Gulshan', 23.8032, 90.4152, 8, 2, '+880288362114'),
('Ibn Sina Hospital, Dhanmondi', 23.7480, 90.3735, 5, 0, '+880258616074'),
('Popular Medical College Hospital, Dhanmondi', 23.7509, 90.3782, 3, 1, '+8809666787060'),
('Kurmitola General Hospital, Uttara', 23.8355, 90.3982, 15, 4, '+88028714433');