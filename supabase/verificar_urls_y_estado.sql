-- =========================================================================
-- DIAGNÓSTICO Y VERIFICACIÓN DE DOMINIOS Y URLs EN SUPABASE
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase
-- =========================================================================

-- 1. Búsqueda de cualquier URL antigua en la tabla de proyectos (JSON y columnas)
SELECT 
  id,
  data->>'name' AS nombre_proyecto,
  CASE 
    WHEN data::text ILIKE '%massa-3d-portal%' THEN '⚠️ Contiene nombre anterior (massa-3d-portal)'
    WHEN data::text ILIKE '%vercel.app%' THEN 'ℹ️ Contiene enlace a vercel.app'
    ELSE '✅ 100% Limpio (Rutas dinámicas e imágenes en Storage)'
  END AS diagnostico_urls
FROM public.projects;

-- 2. Búsqueda de URLs antiguas en archivos multimedia (renders / planos / 3D)
SELECT 
  id,
  project_id,
  title,
  storage_path,
  CASE 
    WHEN storage_path ILIKE '%massa-3d-portal%' OR storage_path ILIKE '%vercel.app%' THEN '⚠️ Requiere revisión'
    ELSE '✅ Ruta relativa de Storage válida'
  END AS estado_storage
FROM public.project_media
LIMIT 20;

-- 3. Conteo y verificación de salud de las tablas operativas
SELECT 'projects' AS tabla, COUNT(*) AS registros FROM public.projects
UNION ALL
SELECT 'massa_3d_users', COUNT(*) FROM public.massa_3d_users
UNION ALL
SELECT 'project_media', COUNT(*) FROM public.project_media
UNION ALL
SELECT 'progress_updates', COUNT(*) FROM public.progress_updates
UNION ALL
SELECT 'tour_visits', COUNT(*) FROM public.tour_visits;
