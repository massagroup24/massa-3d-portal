-- =========================================================
-- TABLA DE USUARIOS Y ACCESOS PARA MASSA GROUP 3D PORTAL
-- =========================================================

-- 1. Crear tabla de usuarios autorizados
CREATE TABLE IF NOT EXISTS public.massa_3d_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'architect', -- 'architect' | 'client' | 'admin'
    allowed_profile TEXT NOT NULL DEFAULT 'architect', -- 'architect' | 'client' | 'both'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Asegurar columnas si la tabla ya existía previamente
ALTER TABLE public.massa_3d_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'architect';
ALTER TABLE public.massa_3d_users ADD COLUMN IF NOT EXISTS allowed_profile TEXT NOT NULL DEFAULT 'architect';

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.massa_3d_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de acceso (Permitir lectura y gestión al cliente web)
DROP POLICY IF EXISTS "Allow public read access to massa_3d_users" ON public.massa_3d_users;
CREATE POLICY "Allow public read access to massa_3d_users"
    ON public.massa_3d_users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow all modifications on massa_3d_users" ON public.massa_3d_users;
CREATE POLICY "Allow all modifications on massa_3d_users"
    ON public.massa_3d_users FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Insertar o actualizar usuarios iniciales
INSERT INTO public.massa_3d_users (username, password, name, role, allowed_profile, active)
VALUES 
    ('juan', 'massa2026', 'Juan David', 'admin', 'both', true),
    ('admin', 'massa2026', 'Administrador General MASSA', 'admin', 'both', true),
    ('editor', 'massa2026', 'Editor Arquitectónico', 'architect', 'architect', true),
    ('cliente', 'massa2026', 'Cliente Propietario', 'client', 'client', true)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    allowed_profile = EXCLUDED.allowed_profile,
    active = true;
