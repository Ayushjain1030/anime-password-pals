-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Verdict enum
CREATE TYPE public.scan_verdict AS ENUM ('safe', 'suspicious', 'malicious', 'error');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Scans (a job)
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'csv' | 'txt'
  total_urls INT NOT NULL DEFAULT 0,
  safe_count INT NOT NULL DEFAULT 0,
  suspicious_count INT NOT NULL DEFAULT 0,
  malicious_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_scans_user_created ON public.scans(user_id, created_at DESC);

-- Scan results (per URL)
CREATE TABLE public.scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  hostname TEXT,
  verdict public.scan_verdict NOT NULL,
  risk_score INT NOT NULL DEFAULT 0,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ssl_valid BOOLEAN,
  ssl_details JSONB,
  reputation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_scan_results_scan ON public.scan_results(scan_id);
CREATE INDEX idx_scan_results_user_created ON public.scan_results(user_id, created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies: profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies: user_roles (read-only by user; admins manage)
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies: scans
CREATE POLICY "Users view own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scans" ON public.scans
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all scans" ON public.scans
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies: scan_results
CREATE POLICY "Users view own scan results" ON public.scan_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own scan results" ON public.scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scan results" ON public.scan_results
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all scan results" ON public.scan_results
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));