-- =========================================================
-- TABLA DE USUARIOS Y ACCESOS PARA MASSA GROUP 3D PORTAL
-- =========================================================

-- 1. Crear tabla de usuarios autorizados
CREATE TABLE IF NOT EXISTS public.massa_3d_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor', -- 'editor' | 'admin'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.massa_3d_users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (Permitir lectura y gestión al cliente web)
DROP POLICY IF EXISTS "Allow public read access to massa_3d_users" ON public.massa_3d_users;
CREATE POLICY "Allow public read access to massa_3d_users"
    ON public.massa_3d_users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow all modifications on massa_3d_users" ON public.massa_3d_users;
CREATE POLICY "Allow all modifications on massa_3d_users"
    ON public.massa_3d_users FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. Insertar usuarios iniciales por defecto
INSERT INTO public.massa_3d_users (username, password, name, role, active)
VALUES 
    ('editor', 'massa2026', 'Editor Principal MASSA', 'editor', true),
    ('admin', 'massa2026', 'Administrador General MASSA', 'admin', true),
    ('juan', 'massa2026', 'Juan David - Dirección MASSA 3D', 'admin', true)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    active = true;
