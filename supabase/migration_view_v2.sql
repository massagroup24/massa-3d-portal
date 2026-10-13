-- =========================================================================
-- MIGRACIÓN SQL Y SEGURIDAD ROBUSTA - VIEW BY MASSA GROUP (v2.2)
-- ORDEN ESTRICTO DE DEPENDENCIAS E IDEMPOTENTE (DROP POLICY IF EXISTS)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. TABLA BASE DE PERFILES DE USUARIO (Requerida por is_architect)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('architect', 'client')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 2. EXTENDER TABLA 'projects' (Sin valores por defecto ficticios)
-- -------------------------------------------------------------------------
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS current_phase TEXT,
  ADD COLUMN IF NOT EXISTS current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  ADD COLUMN IF NOT EXISTS architect_name TEXT,
  ADD COLUMN IF NOT EXISTS architect_role TEXT,
  ADD COLUMN IF NOT EXISTS architect_avatar TEXT,
  ADD COLUMN IF NOT EXISTS architect_phone TEXT,
  ADD COLUMN IF NOT EXISTS architect_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS published_for_client BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Limpieza segura de PIN en tours existentes (compatible con json y jsonb)
UPDATE public.projects
SET data = (data::jsonb - 'pin')::jsonb
WHERE (data::jsonb) ? 'pin';

-- -------------------------------------------------------------------------
-- 3. TABLAS RELACIONALES (Miembros, Medios y Avance de Obra)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('render', 'blueprint', 'model_3d')),
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  phase_title TEXT NOT NULL,
  notes TEXT,
  before_after JSONB,
  published BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.progress_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES public.progress_updates(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_media_lookup ON public.project_media(project_id, type, published);
CREATE INDEX IF NOT EXISTS idx_progress_updates_lookup ON public.progress_updates(project_id, published, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_media_update ON public.progress_media(update_id, order_index);

-- -------------------------------------------------------------------------
-- 4. TRIGGERS DE UPDATED_AT
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER tr_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_project_media_updated_at ON public.project_media;
CREATE TRIGGER tr_project_media_updated_at BEFORE UPDATE ON public.project_media
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_progress_updates_updated_at ON public.progress_updates;
CREATE TRIGGER tr_progress_updates_updated_at BEFORE UPDATE ON public.progress_updates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -------------------------------------------------------------------------
-- 5. FUNCIONES HELPER SECURITY DEFINER (CREADAS ANTES DE LAS POLÍTICAS)
-- -------------------------------------------------------------------------
-- Nota: plpgsql + search_path = public, auth para resolución segura de auth.uid()
CREATE OR REPLACE FUNCTION public.is_architect()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'architect'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.client_has_project(p_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.projects p ON p.id = pm.project_id
    WHERE pm.project_id = p_id 
      AND pm.user_id = auth.uid()
      AND p.published_for_client = true
  );
END;
$$;

-- -------------------------------------------------------------------------
-- 6. VISTA SEGURA PARA TOURS PÚBLICOS 360° (Preserva enlaces existentes)
-- -------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_tours_360 AS
  SELECT id, data
  FROM public.projects;

-- -------------------------------------------------------------------------
-- 7. POLÍTICAS RLS (CON DROP PREVIO PARA SER 100% IDEMPOTENTE)
-- -------------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_visits ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: user_profiles
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  USING (id = (SELECT auth.uid()) OR public.is_architect());

DROP POLICY IF EXISTS "user_profiles_staff_manage" ON public.user_profiles;
CREATE POLICY "user_profiles_staff_manage"
  ON public.user_profiles FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- POLÍTICAS: projects
DROP POLICY IF EXISTS "projects_architect_all" ON public.projects;
CREATE POLICY "projects_architect_all"
  ON public.projects FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

DROP POLICY IF EXISTS "projects_client_select" ON public.projects;
CREATE POLICY "projects_client_select"
  ON public.projects FOR SELECT
  USING (
    published_for_client = true AND EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "projects_anon_tour_select" ON public.projects;
CREATE POLICY "projects_anon_tour_select"
  ON public.projects FOR SELECT
  USING (true);

-- POLÍTICAS: project_members
DROP POLICY IF EXISTS "project_members_architect_all" ON public.project_members;
CREATE POLICY "project_members_architect_all"
  ON public.project_members FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

DROP POLICY IF EXISTS "project_members_client_select" ON public.project_members;
CREATE POLICY "project_members_client_select"
  ON public.project_members FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- POLÍTICAS: project_media
DROP POLICY IF EXISTS "project_media_architect_all" ON public.project_media;
CREATE POLICY "project_media_architect_all"
  ON public.project_media FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

DROP POLICY IF EXISTS "project_media_client_select" ON public.project_media;
CREATE POLICY "project_media_client_select"
  ON public.project_media FOR SELECT
  USING (published = true AND public.client_has_project(project_id));

-- POLÍTICAS: progress_updates
DROP POLICY IF EXISTS "progress_updates_architect_all" ON public.progress_updates;
CREATE POLICY "progress_updates_architect_all"
  ON public.progress_updates FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

DROP POLICY IF EXISTS "progress_updates_client_select" ON public.progress_updates;
CREATE POLICY "progress_updates_client_select"
  ON public.progress_updates FOR SELECT
  USING (published = true AND public.client_has_project(project_id));

-- POLÍTICAS: progress_media
DROP POLICY IF EXISTS "progress_media_architect_all" ON public.progress_media;
CREATE POLICY "progress_media_architect_all"
  ON public.progress_media FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

DROP POLICY IF EXISTS "progress_media_client_select" ON public.progress_media;
CREATE POLICY "progress_media_client_select"
  ON public.progress_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.progress_updates pu
      WHERE pu.id = progress_media.update_id
        AND pu.published = true
        AND public.client_has_project(pu.project_id)
    )
  );

-- POLÍTICAS: tour_visits (Sin lectura pública; solo INSERT anónimo)
DROP POLICY IF EXISTS "Allow anonymous reads of tour_visits" ON public.tour_visits;
DROP POLICY IF EXISTS "Allow anonymous inserts to tour_visits" ON public.tour_visits;
DROP POLICY IF EXISTS "tour_visits_insert_only" ON public.tour_visits;
DROP POLICY IF EXISTS "tour_visits_architect_select" ON public.tour_visits;

CREATE POLICY "tour_visits_insert_only"
  ON public.tour_visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "tour_visits_architect_select"
  ON public.tour_visits FOR SELECT
  USING (public.is_architect());

-- -------------------------------------------------------------------------
-- 8. POLÍTICAS RLS EN STORAGE PARA 'project-vault'
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-vault', 'project-vault', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "project_vault_architect_all" ON storage.objects;
CREATE POLICY "project_vault_architect_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'project-vault' AND public.is_architect()
  )
  WITH CHECK (
    bucket_id = 'project-vault' AND public.is_architect()
  );

DROP POLICY IF EXISTS "project_vault_client_select" ON storage.objects;
CREATE POLICY "project_vault_client_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-vault' AND (
      public.is_architect() OR (
        (storage.foldername(name))[1] = 'projects' AND
        public.client_has_project((storage.foldername(name))[2])
      )
    )
  );

-- -------------------------------------------------------------------------
-- 9. HABILITAR SUPABASE REALTIME
-- -------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'progress_updates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_updates;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'progress_media'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.progress_media;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_media'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_media;
  END IF;
END $$;
