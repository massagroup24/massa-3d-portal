-- =========================================================================
-- MIGRACIÓN: HABILITACIÓN PLENA DEL ROL 'ADMIN' Y CORRECCIÓN DE MÉTRICAS
-- Versión: 20261016_03
-- Plataforma: MASSA VIEW — MASSA GROUP
-- =========================================================================
-- OBJETIVO:
-- 1. Permitir formalmente el rol 'admin' en la tabla public.user_profiles
--    modificando la restricción CHECK.
-- 2. Asegurar que Juan David Figueroa (juandavidfigueroa4@gmail.com) y cualquier
--    cuenta administrativa sean reconocidos con rol 'admin'.
-- 3. Actualizar los triggers y funciones RPC (get_all_users_for_admin,
--    admin_update_user, admin_create_user, handle_auth_user_sync) para que
--    guarden y lean 'admin' sin degradarlo a 'architect'.
-- =========================================================================

-- 1. ACTUALIZAR RESTRICCIÓN CHECK EN public.user_profiles PARA PERMITIR 'admin'
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('architect', 'client', 'admin'));

-- 2. ASIGNAR ROL 'admin' A JUAN DAVID FIGUEROA Y CUENTAS ADMINISTRATIVAS EN user_profiles
UPDATE public.user_profiles
SET 
  role = 'admin',
  updated_at = timezone('utc'::text, now())
WHERE email = 'juandavidfigueroa4@gmail.com'
   OR lower(email) LIKE 'admin%'
   OR lower(email) LIKE '%admin@%'
   OR id IN (
     SELECT id FROM auth.users 
     WHERE (raw_user_meta_data->>'role') = 'admin' 
        OR (raw_app_meta_data->>'role') = 'admin'
        OR email = 'juandavidfigueroa4@gmail.com'
   );

-- 3. ACTUALIZAR METADATOS EN auth.users PARA CUENTAS ADMINISTRADORAS
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb), 
    '{role}', 
    '"admin"'
  ),
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb), 
    '{role}', 
    '"admin"'
  )
WHERE email = 'juandavidfigueroa4@gmail.com'
   OR lower(email) LIKE 'admin%'
   OR lower(email) LIKE '%admin@%';

-- 4. ACTUALIZAR TRIGGER DE SINCRONIZACIÓN: handle_auth_user_sync()
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
  -- Determinar rol de la cuenta respetando 'admin'
  v_role := lower(
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL AND NEW.raw_user_meta_data->>'role' <> '' 
      THEN NEW.raw_user_meta_data->>'role'
      WHEN NEW.raw_app_meta_data->>'role' IS NOT NULL AND NEW.raw_app_meta_data->>'role' <> '' 
      THEN NEW.raw_app_meta_data->>'role'
      WHEN NEW.email = 'juandavidfigueroa4@gmail.com' THEN 'admin'
      WHEN lower(NEW.email) LIKE 'admin%' THEN 'admin'
      WHEN NEW.email LIKE '%@massagroup.co' THEN 'architect'
      ELSE 'client' 
    END
  );

  -- Si no es uno de los roles válidos, asignar 'client' por seguridad
  IF v_role NOT IN ('architect', 'client', 'admin') THEN 
    v_role := 'client'; 
  END IF;

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

-- 5. ACTUALIZAR RPC get_all_users_for_admin() PARA RECONOCER 'admin'
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
      NULLIF(up.role, ''),
      NULLIF(au.raw_user_meta_data->>'role', ''),
      NULLIF(au.raw_app_meta_data->>'role', ''),
      CASE 
        WHEN au.email = 'juandavidfigueroa4@gmail.com' THEN 'admin'
        WHEN lower(au.email) LIKE 'admin%' THEN 'admin'
        WHEN au.email LIKE '%@massagroup.co' THEN 'architect' 
        ELSE 'client' 
      END
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

-- 6. ACTUALIZAR RPC admin_update_user() PARA GUARDAR 'admin'
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
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder o administrador puede modificar cuentas de usuario.';
  END IF;

  -- Respetar 'admin', 'architect' o 'client'
  v_role := CASE 
    WHEN new_role = 'admin' THEN 'admin'
    WHEN new_role = 'architect' THEN 'architect'
    ELSE 'client' 
  END;

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

  -- 2. Actualizar en public.user_profiles
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

-- 7. ACTUALIZAR RPC admin_create_user() PARA GUARDAR 'admin'
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT,
  new_name TEXT,
  new_role TEXT DEFAULT 'architect',
  new_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_new_id UUID;
  v_clean_email TEXT;
  v_clean_name TEXT;
  v_role TEXT;
BEGIN
  IF NOT public.is_architect() THEN
    RAISE EXCEPTION 'Acceso no autorizado: Solo el arquitecto líder o administrador puede crear nuevos usuarios.';
  END IF;

  v_role := CASE 
    WHEN new_role = 'admin' THEN 'admin'
    WHEN new_role = 'architect' THEN 'architect'
    ELSE 'client' 
  END;

  v_clean_email := lower(trim(new_email));
  v_clean_name := trim(new_name);

  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RAISE EXCEPTION 'El correo electrónico es obligatorio.';
  END IF;

  IF length(trim(new_password)) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener un mínimo de 6 caracteres.';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_clean_email) THEN
    RAISE EXCEPTION 'El correo "%" ya está registrado en Supabase Auth.', v_clean_email;
  END IF;

  v_new_id := gen_random_uuid();

  -- Insertar en auth.users con correo confirmado
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
