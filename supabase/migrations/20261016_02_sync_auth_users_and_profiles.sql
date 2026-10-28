-- =========================================================================
-- MIGRACIÓN: SINCRONIZACIÓN BIDIRECCIONAL COMPLETA ENTRE SUPABASE AUTH Y USER_PROFILES
-- Versión: 20261016_02
-- Plataforma: MASSA VIEW — MASSA GROUP
-- =========================================================================
-- OBJETIVO:
-- 1. Sincronizar automáticamente todos los usuarios registrados en Supabase Auth
--    (auth.users) hacia public.user_profiles para que aparezcan en el portal.
-- 2. Reflejar cualquier cambio hecho en Supabase Auth (Dashboard) en public.user_profiles
--    mediante triggers automáticos de PostgreSQL.
-- 3. Permitir que cualquier edición o creación realizada desde el portal web
--    actualice directamente la tabla oficial auth.users mediante funciones RPC seguras.
-- 4. Garantizar que eliminar un usuario en la web o en Supabase Auth limpie ambas tablas.
-- =========================================================================

-- Asegurar extensión para hashing de contraseñas si es requerida
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------------------
-- 1. TABLA BASE: public.user_profiles (Asegurar estructura completa)
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

-- Habilitar RLS en public.user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- 2. FUNCIÓN MEJORADA is_architect() PARA EVITAR BLOQUEOS CIRCULARES
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_architect()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- 1. Si no hay usuario autenticado (anónimo), rechazar
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Verificar rol en user_profiles
  IF EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('architect', 'admin')
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Respaldo: Verificar metadatos o email en auth.users directamente
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND (
      raw_user_meta_data->>'role' IN ('architect', 'admin')
      OR raw_app_meta_data->>'role' IN ('architect', 'admin')
      OR email LIKE '%@massagroup.co'
      OR email = 'juandavidfigueroa4@gmail.com'
    )
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- -------------------------------------------------------------------------
-- 3. RETROALIMENTACIÓN INICIAL (BACKFILL): SINCRONIZAR USUARIOS EXISTENTES
-- -------------------------------------------------------------------------
-- Copia todos los usuarios actuales de auth.users a public.user_profiles
INSERT INTO public.user_profiles (id, email, name, role, phone, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    NULLIF(trim(au.raw_user_meta_data->>'name'), ''),
    NULLIF(trim(au.raw_user_meta_data->>'full_name'), ''),
    split_part(au.email, '@', 1)
  ) AS name,
  CASE 
    WHEN (au.raw_user_meta_data->>'role') = 'admin' OR (au.raw_app_meta_data->>'role') = 'admin' THEN 'architect'
    WHEN (au.raw_user_meta_data->>'role') = 'architect' OR (au.raw_app_meta_data->>'role') = 'architect' THEN 'architect'
    WHEN au.email LIKE '%@massagroup.co' OR au.email = 'juandavidfigueroa4@gmail.com' THEN 'architect'
    ELSE 'client'
  END AS role,
  au.raw_user_meta_data->>'phone' AS phone,
  COALESCE(au.created_at, timezone('utc'::text, now())) AS created_at,
  timezone('utc'::text, now()) AS updated_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = CASE WHEN user_profiles.name IS NULL OR user_profiles.name = '' THEN EXCLUDED.name ELSE user_profiles.name END,
  role = CASE WHEN user_profiles.role IS NULL THEN EXCLUDED.role ELSE user_profiles.role END,
  phone = COALESCE(user_profiles.phone, EXCLUDED.phone),
  updated_at = timezone('utc'::text, now());

-- -------------------------------------------------------------------------
-- 4. TRIGGER: SUPABASE AUTH -> USER_PROFILES (Inserciones y Actualizaciones)
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
  -- Determinar rol
  v_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    NEW.raw_app_meta_data->>'role',
    CASE 
      WHEN NEW.email LIKE '%@massagroup.co' OR NEW.email = 'juandavidfigueroa4@gmail.com' THEN 'architect' 
      ELSE 'client' 
    END
  );
  IF v_role = 'admin' THEN v_role := 'architect'; END IF;
  IF v_role NOT IN ('architect', 'client') THEN v_role := 'client'; END IF;

  -- Determinar nombre completo
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

DROP TRIGGER IF EXISTS tr_auth_user_sync_insert_update ON auth.users;
CREATE TRIGGER tr_auth_user_sync_insert_update
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data, raw_app_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

-- -------------------------------------------------------------------------
-- 5. TRIGGER: SUPABASE AUTH -> USER_PROFILES (Eliminación en Auth Dashboard)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_auth_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM public.user_profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_auth_user_sync_delete ON auth.users;
CREATE TRIGGER tr_auth_user_sync_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_delete();

-- -------------------------------------------------------------------------
-- 6. RPC: OBTENER TODOS LOS USUARIOS REALES DESDE SUPABASE AUTH (Para Arquitecto)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Validar que solo el arquitecto o admin pueda listar todos los usuarios
  IF NOT public.is_architect() THEN
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder o administrador puede listar usuarios.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    COALESCE(
      NULLIF(trim(up.name), ''),
      NULLIF(trim(au.raw_user_meta_data->>'name'), ''),
      NULLIF(trim(au.raw_user_meta_data->>'full_name'), ''),
      split_part(au.email, '@', 1)
    )::TEXT AS name,
    COALESCE(
      up.role,
      au.raw_user_meta_data->>'role',
      au.raw_app_meta_data->>'role',
      CASE WHEN au.email LIKE '%@massagroup.co' OR au.email = 'juandavidfigueroa4@gmail.com' THEN 'architect' ELSE 'client' END
    )::TEXT AS role,
    COALESCE(up.phone, au.raw_user_meta_data->>'phone')::TEXT AS phone,
    COALESCE(up.created_at, au.created_at) AS created_at,
    au.last_sign_in_at,
    (au.banned_until IS NULL OR au.banned_until < now()) AS active
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.id = au.id
  ORDER BY au.created_at ASC;
END;
$$;

-- -------------------------------------------------------------------------
-- 7. RPC: MODIFICAR USUARIO DESDE LA WEB -> ACTUALIZA AUTH.USERS Y USER_PROFILES
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_user_id UUID,
  new_email TEXT DEFAULT NULL,
  new_name TEXT DEFAULT NULL,
  new_role TEXT DEFAULT NULL,
  new_phone TEXT DEFAULT NULL,
  new_password TEXT DEFAULT NULL,
  new_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_role TEXT;
  v_clean_email TEXT;
  v_clean_name TEXT;
BEGIN
  IF NOT public.is_architect() THEN
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder puede modificar cuentas de usuario.';
  END IF;

  v_role := CASE WHEN new_role = 'admin' THEN 'architect' ELSE COALESCE(new_role, 'client') END;
  v_clean_email := NULLIF(trim(lower(new_email)), '');
  v_clean_name := NULLIF(trim(new_name), '');

  -- 1. Actualizar auth.users
  UPDATE auth.users
  SET 
    email = COALESCE(v_clean_email, email),
    encrypted_password = CASE 
      WHEN new_password IS NOT NULL AND length(trim(new_password)) >= 6 
      THEN crypt(trim(new_password), gen_salt('bf'))
      ELSE encrypted_password 
    END,
    raw_user_meta_data = jsonb_set(
      jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{name}',
        to_jsonb(COALESCE(v_clean_name, raw_user_meta_data->>'name', ''))
      ),
      '{role}',
      to_jsonb(v_role)
    ),
    raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(v_role)
    ),
    banned_until = CASE 
      WHEN new_active IS FALSE THEN '3000-01-01 00:00:00+00'::timestamptz 
      WHEN new_active IS TRUE THEN NULL 
      ELSE banned_until 
    END,
    updated_at = timezone('utc'::text, now())
  WHERE id = target_user_id;

  -- 2. Actualizar o insertar en public.user_profiles
  INSERT INTO public.user_profiles (id, email, name, role, phone, updated_at)
  VALUES (
    target_user_id,
    COALESCE(v_clean_email, (SELECT email FROM auth.users WHERE id = target_user_id)),
    COALESCE(v_clean_name, 'Usuario MASSA'),
    v_role,
    new_phone,
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(v_clean_email, user_profiles.email),
    name = COALESCE(v_clean_name, user_profiles.name),
    role = v_role,
    phone = COALESCE(new_phone, user_profiles.phone),
    updated_at = timezone('utc'::text, now());

  RETURN jsonb_build_object(
    'success', true, 
    'id', target_user_id,
    'email', COALESCE(v_clean_email, (SELECT email FROM auth.users WHERE id = target_user_id)),
    'name', COALESCE(v_clean_name, 'Usuario MASSA'),
    'role', v_role
  );
END;
$$;

-- -------------------------------------------------------------------------
-- 8. RPC: ELIMINAR USUARIO DESDE LA WEB -> ELIMINA EN AUTH.USERS Y USER_PROFILES
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_architect() THEN
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder puede eliminar cuentas de usuario.';
  END IF;

  -- Eliminar de auth.users (desencadena cascada y trigger delete)
  DELETE FROM auth.users WHERE id = target_user_id;
  DELETE FROM public.user_profiles WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'id', target_user_id);
END;
$$;

-- -------------------------------------------------------------------------
-- 9. RPC: CREAR USUARIO CONFIRMADO DIRECTAMENTE EN AUTH.USERS Y PERFILES
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT,
  new_name TEXT,
  new_role TEXT DEFAULT 'client',
  new_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_new_id UUID;
  v_role TEXT;
  v_clean_email TEXT;
  v_clean_name TEXT;
BEGIN
  IF NOT public.is_architect() THEN
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder puede crear nuevos usuarios.';
  END IF;

  v_role := CASE WHEN new_role = 'admin' THEN 'architect' ELSE COALESCE(new_role, 'client') END;
  v_clean_email := lower(trim(new_email));
  v_clean_name := trim(new_name);

  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RAISE EXCEPTION 'El correo electrónico es obligatorio.';
  END IF;

  IF length(trim(new_password)) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener un mínimo de 6 caracteres.';
  END IF;

  -- Verificar si el correo ya existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_clean_email) THEN
    RAISE EXCEPTION 'El correo "%" ya está registrado en Supabase Auth.', v_clean_email;
  END IF;

  v_new_id := gen_random_uuid();

  -- Insertar en auth.users con correo confirmado de inmediato
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_new_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_clean_email,
    crypt(trim(new_password), gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'role', v_role),
    jsonb_build_object('name', v_clean_name, 'role', v_role, 'phone', new_phone),
    now(),
    now()
  );

  -- Insertar en user_profiles
  INSERT INTO public.user_profiles (id, email, name, role, phone, created_at, updated_at)
  VALUES (
    v_new_id,
    v_clean_email,
    v_clean_name,
    v_role,
    new_phone,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'id', v_new_id,
    'email', v_clean_email,
    'name', v_clean_name,
    'role', v_role
  );
END;
$$;

-- -------------------------------------------------------------------------
-- 10. POLÍTICAS RLS SEGURAS PARA public.user_profiles
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
CREATE POLICY "user_profiles_select"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.is_architect()
  );

DROP POLICY IF EXISTS "user_profiles_staff_manage" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_architect_insert" ON public.user_profiles;
CREATE POLICY "user_profiles_architect_insert"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid() OR public.is_architect()
  );

DROP POLICY IF EXISTS "user_profiles_architect_update" ON public.user_profiles;
CREATE POLICY "user_profiles_architect_update"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR public.is_architect()
  )
  WITH CHECK (
    id = auth.uid() OR public.is_architect()
  );

DROP POLICY IF EXISTS "user_profiles_architect_delete" ON public.user_profiles;
CREATE POLICY "user_profiles_architect_delete"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (
    public.is_architect()
  );

-- -------------------------------------------------------------------------
-- 11. PERMISOS DE EJECUCIÓN (GRANTS)
-- -------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_architect() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
