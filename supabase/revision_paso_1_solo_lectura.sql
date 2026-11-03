-- Ejecutar primero en SQL Editor. Solo lee datos necesarios para revisar
-- la migración; no modifica usuarios, archivos ni proyectos.
SELECT 'cuenta' AS seccion,
  jsonb_build_object(
    'id', u.id,
    'confirmada', u.email_confirmed_at IS NOT NULL,
    'habilitada', u.banned_until IS NULL OR u.banned_until <= now(),
    'perfil', p.role
  ) AS detalle
FROM auth.users u LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE lower(u.email) = 'juandavidfigueroa4@gmail.com'
UNION ALL
SELECT 'proyecto', jsonb_build_object(
  'id', id, 'nombre', data->>'name', 'publicado', published_for_client
)
FROM public.projects
UNION ALL
SELECT 'columna', jsonb_build_object('tabla', table_name, 'campo', column_name)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('progress_updates', 'progress_media')
  AND column_name IN ('id', 'project_id', 'update_id', 'progress_id', 'recorded_at',
                      'update_date', 'published', 'storage_path', 'thumbnail_path')
ORDER BY seccion, detalle;
