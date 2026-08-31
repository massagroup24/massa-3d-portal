-- Crear la tabla de visitas
CREATE TABLE IF NOT EXISTS public.tour_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id TEXT NOT NULL,
    project_name TEXT,
    platform TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.tour_visits ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir a cualquiera insertar (visitantes)
CREATE POLICY "Allow anonymous inserts to tour_visits" ON public.tour_visits
    FOR INSERT WITH CHECK (true);

-- Crear políticas para permitir a cualquiera leer (para el dashboard de editores por ahora)
CREATE POLICY "Allow anonymous reads of tour_visits" ON public.tour_visits
    FOR SELECT USING (true);
