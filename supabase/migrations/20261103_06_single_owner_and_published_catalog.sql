-- Una única cuenta administradora y catálogo publicado.
-- Ejecutar como propietario de la base de datos, tras verificar el acceso real
-- de la cuenta indicada. La transacción aborta si no existe o no está confirmada.
BEGIN;

CREATE TABLE IF NOT EXISTS public.platform_admin (
  singleton BOOLEAN PRIMARY KEY DEFAULT true CHECK (singleton),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT
);
ALTER TABLE public.platform_admin ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.platform_admin FROM PUBLIC, anon, authenticated;

-- Activar esta función como Custom Access Token Hook en Supabase Auth después
-- de aplicar la migración. Impide emitir o renovar sesiones de otras cuentas.
CREATE OR REPLACE FUNCTION public.platform_access_token_hook(event JSONB)
RETURNS JSONB LANGUAGE plpgsql STABLE
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.platform_admin
    WHERE user_id::text = event->>'user_id'
      AND user_id::text = event->'claims'->>'sub') THEN
    RETURN jsonb_build_object('error', jsonb_build_object('http_code', 403,
      'message', 'El acceso está reservado a la única cuenta administradora autorizada.'));
  END IF;
  RETURN event;
END $$;
REVOKE ALL ON FUNCTION public.platform_access_token_hook(JSONB) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.platform_admin TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.platform_access_token_hook(JSONB) TO supabase_auth_admin;
DROP POLICY IF EXISTS platform_admin_auth_read ON public.platform_admin;
CREATE POLICY platform_admin_auth_read ON public.platform_admin FOR SELECT TO supabase_auth_admin USING (true);

DO $$
DECLARE owner_id UUID;
BEGIN
  SELECT id INTO STRICT owner_id FROM auth.users
  WHERE lower(email) = 'juandavidfigueroa4@gmail.com'
    AND email_confirmed_at IS NOT NULL
    AND (banned_until IS NULL OR banned_until <= now());
  IF EXISTS (SELECT 1 FROM public.platform_admin WHERE user_id <> owner_id) THEN
    RAISE EXCEPTION 'La identidad autorizada ya está vinculada a otra cuenta. Revisar antes de continuar.';
  END IF;
  INSERT INTO public.platform_admin(singleton, user_id) VALUES (true, owner_id)
    ON CONFLICT (singleton) DO NOTHING;
END $$;

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('admin', 'architect', 'client'));

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admin pa
    JOIN public.user_profiles up ON up.id = pa.user_id
    JOIN auth.users au ON au.id = pa.user_id
    WHERE pa.user_id = auth.uid() AND up.role = 'admin'
      AND lower(au.email) = 'juandavidfigueroa4@gmail.com'
      AND au.email_confirmed_at IS NOT NULL
      AND (au.banned_until IS NULL OR au.banned_until <= now())
  );
$$;
REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO anon, authenticated;

-- Compatibilidad con RPC existentes: siempre delegar en la identidad por UUID.
CREATE OR REPLACE FUNCTION public.is_architect()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth AS $$ SELECT public.is_platform_admin(); $$;
CREATE OR REPLACE FUNCTION public.is_massa_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth AS $$ SELECT public.is_platform_admin(); $$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE trusted_role TEXT;
BEGIN
  trusted_role := CASE WHEN EXISTS (
    SELECT 1 FROM public.platform_admin WHERE user_id = NEW.id
  ) THEN 'admin' ELSE 'client' END;
  INSERT INTO public.user_profiles(id, email, name, role, phone)
  VALUES (NEW.id, NEW.email,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1)),
    trusted_role, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = trusted_role,
    name = EXCLUDED.name, phone = COALESCE(EXCLUDED.phone, user_profiles.phone), updated_at = now();
  RETURN NEW;
END $$;

-- No eliminar cuentas ni proyectos. Retirar únicamente privilegios anteriores.
UPDATE public.user_profiles SET role = 'client'
WHERE id NOT IN (SELECT user_id FROM public.platform_admin) AND role IN ('admin', 'architect');
INSERT INTO public.user_profiles(id, email, name, role)
SELECT au.id, au.email, COALESCE(NULLIF(au.raw_user_meta_data->>'name', ''), 'Juan David Figueroa'), 'admin'
FROM auth.users au JOIN public.platform_admin pa ON pa.user_id = au.id
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'admin';

-- Retirar todas las políticas anteriores de estas tablas, incluidas aperturas
-- comerciales universales. Las demás tablas de la aplicación no se alteran.
DO $$ DECLARE item RECORD;
BEGIN
  FOR item IN SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN (
      'projects', 'user_profiles', 'project_members', 'project_media',
      'progress_updates', 'progress_media', 'tour_visits', 'massa_3d_users'
    )
  LOOP EXECUTE format('DROP POLICY %I ON %I.%I', item.policyname, item.schemaname, item.tablename); END LOOP;
  FOR item IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'projects', 'user_profiles', 'project_members', 'project_media',
    'progress_updates', 'progress_media', 'tour_visits', 'massa_3d_users'
  )
  LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename); END LOOP;
END $$;

CREATE POLICY owner_projects ON public.projects FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY own_profile_read ON public.user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
REVOKE INSERT, UPDATE, DELETE ON public.user_profiles FROM anon, authenticated;
CREATE POLICY owner_members ON public.project_members FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE OR REPLACE VIEW public.public_projects WITH (security_barrier = true, security_invoker = false) AS
SELECT id, data - ARRAY['pin', 'clientName', 'phase', 'progress']::text[] AS data, published_for_client
FROM public.projects WHERE published_for_client IS TRUE;
CREATE OR REPLACE VIEW public.public_tours_360 WITH (security_barrier = true, security_invoker = false) AS
SELECT id, data FROM public.public_projects;
REVOKE ALL ON public.public_projects, public.public_tours_360 FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_projects, public.public_tours_360 TO anon, authenticated;

CREATE POLICY owner_media ON public.project_media FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY published_media ON public.project_media FOR SELECT TO anon, authenticated
  USING (published IS TRUE AND project_id IN (SELECT id FROM public.public_projects));
CREATE POLICY owner_progress ON public.progress_updates FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY published_progress ON public.progress_updates FOR SELECT TO anon, authenticated
  USING (published IS TRUE AND project_id IN (SELECT id FROM public.public_projects));
CREATE POLICY owner_progress_media ON public.progress_media FOR ALL TO authenticated
  USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
CREATE POLICY published_progress_media ON public.progress_media FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.progress_updates pu
    WHERE pu.id = progress_media.update_id AND pu.published IS TRUE
      AND pu.project_id IN (SELECT id FROM public.public_projects)));
CREATE POLICY owner_visit_read ON public.tour_visits FOR SELECT TO authenticated USING (public.is_platform_admin());
CREATE POLICY published_visit_insert ON public.tour_visits FOR INSERT TO anon, authenticated
  WITH CHECK (project_id IN (SELECT id FROM public.public_projects) OR public.is_platform_admin());

-- No admitir altas, bajas ni cambios de identidad desde las RPC heredadas.
DO $$ DECLARE item RECORD;
BEGIN
  FOR item IN SELECT p.oid::regprocedure AS signature FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'admin_create_user', 'admin_update_user', 'admin_delete_user', 'get_all_users_for_admin'
    )
  LOOP EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', item.signature); END LOOP;
  IF to_regclass('public.massa_3d_users') IS NOT NULL THEN
    REVOKE ALL ON public.massa_3d_users FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- Los buckets privados obligan a consultar RLS incluso con una URL conocida.
UPDATE storage.buckets SET public = false WHERE id IN ('tour-images', 'project-vault');

CREATE OR REPLACE FUNCTION public.is_published_storage_object(object_bucket TEXT, object_name TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT object_bucket IN ('tour-images', 'project-vault') AND (
    EXISTS (
      SELECT 1 FROM public.projects p,
        LATERAL jsonb_path_query(p.data, '$.** ? (@.type() == "string")') AS refs(value)
      WHERE p.published_for_client IS TRUE AND (
        refs.value #>> '{}' = object_name OR
        refs.value #>> '{}' = 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/' || object_bucket || '/' || object_name
      )
    ) OR EXISTS (
      SELECT 1 FROM public.project_media m JOIN public.projects p ON p.id = m.project_id
      WHERE p.published_for_client IS TRUE AND m.published IS TRUE
        AND object_bucket = 'project-vault'
        AND (m.storage_path = object_name OR m.thumbnail_path = object_name)
    ) OR EXISTS (
      SELECT 1 FROM public.progress_media m JOIN public.progress_updates u ON u.id = m.update_id
      JOIN public.projects p ON p.id = u.project_id
      WHERE p.published_for_client IS TRUE AND u.published IS TRUE
        AND object_bucket = 'project-vault'
        AND (m.storage_path = object_name OR m.thumbnail_path = object_name)
    )
  );
$$;
REVOKE ALL ON FUNCTION public.is_published_storage_object(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_published_storage_object(TEXT, TEXT) TO anon, authenticated;

-- Las políticas restrictivas cierran también cualquier política permisiva vieja
-- sobre estos buckets; no afectan buckets de otros módulos.
DROP POLICY IF EXISTS platform_storage_read_guard ON storage.objects;
DROP POLICY IF EXISTS platform_storage_insert_guard ON storage.objects;
DROP POLICY IF EXISTS platform_storage_update_guard ON storage.objects;
DROP POLICY IF EXISTS platform_storage_delete_guard ON storage.objects;
DROP POLICY IF EXISTS platform_storage_read ON storage.objects;
DROP POLICY IF EXISTS platform_storage_owner ON storage.objects;
CREATE POLICY platform_storage_read_guard ON storage.objects AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (bucket_id NOT IN ('tour-images', 'project-vault') OR public.is_platform_admin() OR public.is_published_storage_object(bucket_id, name));
CREATE POLICY platform_storage_insert_guard ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id NOT IN ('tour-images', 'project-vault') OR public.is_platform_admin());
CREATE POLICY platform_storage_update_guard ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (bucket_id NOT IN ('tour-images', 'project-vault') OR public.is_platform_admin())
  WITH CHECK (bucket_id NOT IN ('tour-images', 'project-vault') OR public.is_platform_admin());
CREATE POLICY platform_storage_delete_guard ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (bucket_id NOT IN ('tour-images', 'project-vault') OR public.is_platform_admin());
CREATE POLICY platform_storage_read ON storage.objects FOR SELECT TO anon, authenticated
  USING (public.is_published_storage_object(bucket_id, name));
CREATE POLICY platform_storage_owner ON storage.objects FOR ALL TO authenticated
  USING (bucket_id IN ('tour-images', 'project-vault') AND public.is_platform_admin())
  WITH CHECK (bucket_id IN ('tour-images', 'project-vault') AND public.is_platform_admin());

COMMIT;
