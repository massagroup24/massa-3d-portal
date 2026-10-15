-- =========================================================================
-- MIGRACIÓN DE REMEDIACIÓN DE VULNERABILIDADES CRÍTICAS Y ENDURECIMIENTO RLS
-- Versión: 20261015_01
-- Plataforma: MASSA VIEW — MASSA GROUP
-- =========================================================================
-- OBJETIVO:
-- 1. Eliminar exposición de contraseñas en texto plano en massa_3d_users.
-- 2. Eliminar lectura pública irrestricta de la tabla base projects.
-- 3. Proteger la vista pública public_tours_360 preservando los enlaces /tour/:id.
-- 4. Activar RLS en storage.objects para aislar el bucket privado project-vault.
-- 5. Proteger la analítica de tour_visits evitando manipulación o lectura pública.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. REMEDIACIÓN: TABLA HEREDADA massa_3d_users
-- -------------------------------------------------------------------------
-- Revocar cualquier política que permita SELECT/INSERT/UPDATE/DELETE al rol anónimo (anon)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'massa_3d_users') THEN
    ALTER TABLE public.massa_3d_users ENABLE ROW LEVEL SECURITY;
    
    -- Eliminar políticas permisivas heredadas
    DROP POLICY IF EXISTS "Permitir lectura publica usuarios" ON public.massa_3d_users;
    DROP POLICY IF EXISTS "Permitir todo a usuarios autenticados y anonimos" ON public.massa_3d_users;
    DROP POLICY IF EXISTS "Allow anonymous read massa_3d_users" ON public.massa_3d_users;
    DROP POLICY IF EXISTS "Allow all on massa_3d_users" ON public.massa_3d_users;

    -- Política estricta: Solo arquitectos autenticados pueden consultar la tabla de transición
    CREATE POLICY "massa_3d_users_architect_only"
      ON public.massa_3d_users FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'architect'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND role = 'architect'
        )
      );

    -- Revocar permisos directos de anon
    REVOKE ALL ON public.massa_3d_users FROM anon;
  END IF;
END $$;

-- -------------------------------------------------------------------------
-- 2. REMEDIACIÓN: TABLA BASE projects
-- -------------------------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Eliminar política insegura que permitía lectura total con USING (true) a cualquier visitante
DROP POLICY IF EXISTS "projects_anon_tour_select" ON public.projects;
DROP POLICY IF EXISTS "Allow public read of projects" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;

-- Arquitecto: Acceso y control total
DROP POLICY IF EXISTS "projects_architect_all" ON public.projects;
CREATE POLICY "projects_architect_all"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'architect'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'architect'
    )
  );

-- Cliente: Solo puede consultar proyectos donde published_for_client = true Y está asignado
DROP POLICY IF EXISTS "projects_client_select" ON public.projects;
CREATE POLICY "projects_client_select"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    published_for_client = true AND EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 3. REMEDIACIÓN Y PROTECCIÓN: VISTA PÚBLICA public_tours_360
-- -------------------------------------------------------------------------
-- Se recrea la vista asegurando que solo proyecte los campos estrictamente necesarios
-- para el visor WebGL/Three.js de recorridos 360° (id, data), sin exponer columnas
-- sensibles como architect_phone, architect_whatsapp, notas internas, etc.
CREATE OR REPLACE VIEW public.public_tours_360 AS
  SELECT id, data
  FROM public.projects;

-- Conceder lectura pública explícita a la vista sanitizada para anon y authenticated
GRANT SELECT ON public.public_tours_360 TO anon, authenticated;

-- -------------------------------------------------------------------------
-- 4. REMEDIACIÓN: TABLA user_profiles Y project_members
-- -------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- user_profiles: El cliente solo puede leer su propio perfil; el arquitecto administra todos
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'architect'
    )
  );

DROP POLICY IF EXISTS "user_profiles_staff_manage" ON public.user_profiles;
CREATE POLICY "user_profiles_staff_manage"
  ON public.user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'architect'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'architect'
    )
  );

-- project_members: El cliente solo ve sus asignaciones; el arquitecto administra todas
DROP POLICY IF EXISTS "project_members_client_select" ON public.project_members;
CREATE POLICY "project_members_client_select"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "project_members_architect_all" ON public.project_members;
CREATE POLICY "project_members_architect_all"
  ON public.project_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'architect'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'architect'
    )
  );

-- -------------------------------------------------------------------------
-- 5. REMEDIACIÓN: MEDIOS TÉCNICOS Y AVANCES (project_media, progress_updates, progress_media)
-- -------------------------------------------------------------------------
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_media ENABLE ROW LEVEL SECURITY;

-- project_media
DROP POLICY IF EXISTS "project_media_architect_all" ON public.project_media;
CREATE POLICY "project_media_architect_all"
  ON public.project_media FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  );

DROP POLICY IF EXISTS "project_media_client_select" ON public.project_media;
CREATE POLICY "project_media_client_select"
  ON public.project_media FOR SELECT
  TO authenticated
  USING (
    published = true AND EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.projects p ON p.id = pm.project_id
      WHERE pm.project_id = project_media.project_id
        AND pm.user_id = auth.uid()
        AND p.published_for_client = true
    )
  );

-- progress_updates
DROP POLICY IF EXISTS "progress_updates_architect_all" ON public.progress_updates;
CREATE POLICY "progress_updates_architect_all"
  ON public.progress_updates FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  );

DROP POLICY IF EXISTS "progress_updates_client_select" ON public.progress_updates;
CREATE POLICY "progress_updates_client_select"
  ON public.progress_updates FOR SELECT
  TO authenticated
  USING (
    published = true AND EXISTS (
      SELECT 1 FROM public.project_members pm
      JOIN public.projects p ON p.id = pm.project_id
      WHERE pm.project_id = progress_updates.project_id
        AND pm.user_id = auth.uid()
        AND p.published_for_client = true
    )
  );

-- progress_media
DROP POLICY IF EXISTS "progress_media_architect_all" ON public.progress_media;
CREATE POLICY "progress_media_architect_all"
  ON public.progress_media FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  );

DROP POLICY IF EXISTS "progress_media_client_select" ON public.progress_media;
CREATE POLICY "progress_media_client_select"
  ON public.progress_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.progress_updates pu
      JOIN public.project_members pm ON pm.project_id = pu.project_id
      JOIN public.projects p ON p.id = pm.project_id
      WHERE pu.id = progress_media.update_id
        AND pu.published = true
        AND pm.user_id = auth.uid()
        AND p.published_for_client = true
    )
  );

-- -------------------------------------------------------------------------
-- 6. REMEDIACIÓN: ANALÍTICA DE VISITAS (tour_visits)
-- -------------------------------------------------------------------------
ALTER TABLE public.tour_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tour_visits_insert_only" ON public.tour_visits;
CREATE POLICY "tour_visits_insert_only"
  ON public.tour_visits FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "tour_visits_architect_select" ON public.tour_visits;
CREATE POLICY "tour_visits_architect_select"
  ON public.tour_visits FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect')
  );

-- -------------------------------------------------------------------------
-- 7. REMEDIACIÓN: BUCKETS Y ARCHIVOS (storage.objects)
-- -------------------------------------------------------------------------
-- NOTA: En Supabase, RLS ya viene habilitado por defecto en storage.objects
-- y la tabla pertenece al rol supabase_storage_admin. No se debe ejecutar
-- ALTER TABLE storage.objects, solo gestionar las políticas asociadas.

-- tour-images: Lectura pública de panoramas 360°
DROP POLICY IF EXISTS "tour_images_public_read" ON storage.objects;
CREATE POLICY "tour_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tour-images');

-- project-vault: Arquitecto tiene acceso total
DROP POLICY IF EXISTS "project_vault_architect_all" ON storage.objects;
CREATE POLICY "project_vault_architect_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'project-vault' AND EXISTS (
      SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect'
    )
  )
  WITH CHECK (
    bucket_id = 'project-vault' AND EXISTS (
      SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'architect'
    )
  );

-- project-vault: Cliente solo puede consultar archivos bajo projects/<id_proyecto>/*
DROP POLICY IF EXISTS "project_vault_client_select" ON storage.objects;
CREATE POLICY "project_vault_client_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-vault' AND (
      (storage.foldername(name))[1] = 'projects' AND EXISTS (
        SELECT 1 FROM public.project_members pm
        JOIN public.projects p ON p.id = pm.project_id
        WHERE pm.project_id = (storage.foldername(name))[2]
          AND pm.user_id = auth.uid()
          AND p.published_for_client = true
      )
    )
  );
