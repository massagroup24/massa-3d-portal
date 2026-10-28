-- =========================================================================
-- MIGRACIÓN: PIVOTE COMERCIAL Y UNIFICACIÓN DE ACCESO ADMINISTRADOR
-- Versión: 20261019_04
-- Plataforma: MASSA VIEW — MASSA GROUP
-- =========================================================================
-- OBJETIVO DEL NEGOCIO:
-- 1. La web se enfoca 100% en la exhibición y venta comercial de proyectos.
-- 2. Los clientes y compradores acceden libremente (rol 'anon' / público)
--    sin requerir autenticación para ver proyectos, renders, planos y 3D.
-- 3. Se unifica el acceso administrativo a un único login: 'Administrador'
--    (abarcando 'admin' y 'architect' con privilegios totales de CMS/Editor).
-- 4. Apertura de políticas RLS de lectura para el catálogo público comercial.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. ASEGURAR RESTRICCIÓN DE ROLES EN public.user_profiles
-- -------------------------------------------------------------------------
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('architect', 'admin', 'client'));

-- -------------------------------------------------------------------------
-- 2. ASCENDER CUENTAS DEL EQUIPO MASSA A ADMINISTRADOR
-- -------------------------------------------------------------------------
UPDATE public.user_profiles
SET 
  role = CASE 
    WHEN email = 'juandavidfigueroa4@gmail.com' OR lower(email) LIKE 'admin%' THEN 'admin'
    ELSE 'architect'
  END,
  updated_at = timezone('utc'::text, now())
WHERE email = 'juandavidfigueroa4@gmail.com'
   OR lower(email) LIKE 'admin%'
   OR lower(email) LIKE '%admin@%'
   OR email LIKE '%@massagroup.co'
   OR email LIKE '%@massagroup.com';

-- Sincronizar metadatos en auth.users
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    to_jsonb(CASE 
      WHEN email = 'juandavidfigueroa4@gmail.com' OR lower(email) LIKE 'admin%' THEN 'admin'::text
      ELSE 'architect'::text
    END)
  ),
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{role}', 
    to_jsonb(CASE 
      WHEN email = 'juandavidfigueroa4@gmail.com' OR lower(email) LIKE 'admin%' THEN 'admin'::text
      ELSE 'architect'::text
    END)
  )
WHERE email = 'juandavidfigueroa4@gmail.com'
   OR lower(email) LIKE 'admin%'
   OR lower(email) LIKE '%admin@%'
   OR email LIKE '%@massagroup.co'
   OR email LIKE '%@massagroup.com';

-- -------------------------------------------------------------------------
-- 3. ACTUALIZAR FUNCIÓN is_architect() PARA ADMINISTRACIÓN TOTAL
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_architect()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Si no hay usuario autenticado, no es administrador
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Verificar en user_profiles
  IF EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('architect', 'admin')
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Respaldo por metadatos o correos autorizados
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND (
      raw_user_meta_data->>'role' IN ('architect', 'admin')
      OR raw_app_meta_data->>'role' IN ('architect', 'admin')
      OR email = 'juandavidfigueroa4@gmail.com'
      OR email LIKE '%@massagroup.co'
      OR email LIKE '%@massagroup.com'
      OR lower(email) LIKE 'admin%'
    )
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- -------------------------------------------------------------------------
-- 4. POLÍTICAS RLS PARA ACCESO COMERCIAL PÚBLICO (ANON) Y EDICIÓN ADMIN
-- -------------------------------------------------------------------------

-- TABLA: projects
-- Lectura pública universal (catálogo comercial)
DROP POLICY IF EXISTS "projects_anon_tour_select" ON public.projects;
DROP POLICY IF EXISTS "projects_public_select" ON public.projects;
CREATE POLICY "projects_public_select"
  ON public.projects FOR SELECT
  USING (true);

-- Edición exclusiva para Administradores
DROP POLICY IF EXISTS "projects_architect_all" ON public.projects;
CREATE POLICY "projects_architect_all"
  ON public.projects FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- TABLA: project_media (Renders, Planos, Recorridos)
-- Lectura pública universal para que el cliente interesado vea los renders del lugar
DROP POLICY IF EXISTS "project_media_client_select" ON public.project_media;
DROP POLICY IF EXISTS "project_media_public_select" ON public.project_media;
CREATE POLICY "project_media_public_select"
  ON public.project_media FOR SELECT
  USING (true);

-- Edición exclusiva para Administradores (CMS)
DROP POLICY IF EXISTS "project_media_architect_all" ON public.project_media;
CREATE POLICY "project_media_architect_all"
  ON public.project_media FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- TABLA: progress_updates (Avances de obra de las residencias)
DROP POLICY IF EXISTS "progress_updates_client_select" ON public.progress_updates;
DROP POLICY IF EXISTS "progress_updates_public_select" ON public.progress_updates;
CREATE POLICY "progress_updates_public_select"
  ON public.progress_updates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "progress_updates_architect_all" ON public.progress_updates;
CREATE POLICY "progress_updates_architect_all"
  ON public.progress_updates FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- TABLA: progress_media (Fotos/Videos de avance)
ALTER TABLE IF EXISTS public.progress_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "progress_media_public_select" ON public.progress_media;
CREATE POLICY "progress_media_public_select"
  ON public.progress_media FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "progress_media_architect_all" ON public.progress_media;
CREATE POLICY "progress_media_architect_all"
  ON public.progress_media FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- TABLA: user_profiles
-- Solo el administrador o el dueño del perfil puede consultar y modificar
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid() OR public.is_architect());

DROP POLICY IF EXISTS "user_profiles_staff_manage" ON public.user_profiles;
CREATE POLICY "user_profiles_staff_manage"
  ON public.user_profiles FOR ALL
  USING (public.is_architect())
  WITH CHECK (public.is_architect());

-- -------------------------------------------------------------------------
-- 5. STORAGE BUCKET: 'project-vault'
-- Lectura pública de imágenes, renders y texturas 360; subida solo admin
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "project_vault_public_read" ON storage.objects;
CREATE POLICY "project_vault_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-vault');

DROP POLICY IF EXISTS "project_vault_admin_manage" ON storage.objects;
CREATE POLICY "project_vault_admin_manage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'project-vault' AND public.is_architect())
  WITH CHECK (bucket_id = 'project-vault' AND public.is_architect());

-- -------------------------------------------------------------------------
-- 6. ACTUALIZAR TRIGGER DE SINCRONIZACIÓN AUTOMÁTICA
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role TEXT;
  v_name TEXT;
BEGIN
  -- Asignar rol respetando la administración unificada
  v_role := lower(
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL AND NEW.raw_user_meta_data->>'role' <> '' 
      THEN NEW.raw_user_meta_data->>'role'
      WHEN NEW.raw_app_meta_data->>'role' IS NOT NULL AND NEW.raw_app_meta_data->>'role' <> '' 
      THEN NEW.raw_app_meta_data->>'role'
      WHEN NEW.email = 'juandavidfigueroa4@gmail.com' THEN 'admin'
      WHEN lower(NEW.email) LIKE 'admin%' THEN 'admin'
      WHEN NEW.email LIKE '%@massagroup.co' OR NEW.email LIKE '%@massagroup.com' THEN 'architect'
      ELSE 'architect' -- En el nuevo modelo centrado en admin, los nuevos registros del equipo son gestores
    END
  );

  IF v_role NOT IN ('architect', 'admin', 'client') THEN 
    v_role := 'architect'; 
  END IF;

  v_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.user_profiles (id, email, name, role, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.created_at, timezone('utc'::text, now())),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE 
      WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL AND NEW.raw_user_meta_data->>'name' <> '' 
      THEN NEW.raw_user_meta_data->>'name' 
      ELSE user_profiles.name 
    END,
    role = v_role,
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', user_profiles.phone),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;
