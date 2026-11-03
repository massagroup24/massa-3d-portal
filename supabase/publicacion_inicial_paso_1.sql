-- Configuración inicial elegida por el usuario: Hacienda F22 e Ibiza A14 públicos;
-- Edinson Jejen y Marquimoda como borradores. Ejecutar después de la migración 06.
-- No volver a ejecutar para conservar decisiones de publicación posteriores.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.platform_admin') IS NULL OR to_regclass('public.public_projects') IS NULL THEN
    RAISE EXCEPTION 'Primero debe aplicarse la migración 20261103_06.';
  END IF;
  IF (SELECT count(*) FROM public.projects WHERE id IN (
    'project_hacienda_f22', 'project_ibiza_a14',
    'project_1781963945215', 'project_1782912175010'
  )) <> 4 THEN
    RAISE EXCEPTION 'No se encontraron los cuatro proyectos revisados. No se modificó la publicación.';
  END IF;
END $$;

UPDATE public.projects
SET published_for_client = id IN ('project_hacienda_f22', 'project_ibiza_a14')
WHERE id IN (
  'project_hacienda_f22', 'project_ibiza_a14',
  'project_1781963945215', 'project_1782912175010'
);

COMMIT;

SELECT id, data->>'name' AS nombre, published_for_client AS publicado
FROM public.projects
WHERE id IN (
  'project_hacienda_f22', 'project_ibiza_a14',
  'project_1781963945215', 'project_1782912175010'
)
ORDER BY publicado DESC, id;
