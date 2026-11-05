-- Actualización de contenido F22. Ejecutar en SQL Editor de Supabase.
-- Transcripción del cuadro aportado por el propietario el 3 de noviembre de 2026.
-- Conserva los IDs, rutas, coordenadas y destinos del 360, y la publicación.
-- No modifica usuarios, políticas de acceso ni proyectos distintos de F22.
BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.projects WHERE id = 'project_hacienda_f22') <> 1 THEN
    RAISE EXCEPTION 'No se encontró el registro único de Hacienda Club F22. No se modificó nada.';
  END IF;
  IF (SELECT jsonb_typeof(data) FROM public.projects WHERE id = 'project_hacienda_f22') IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Los datos de F22 no son un objeto JSON. Revisar antes de continuar.';
  END IF;
END $$;

-- Guardar el resultado de esta consulta si se desea conservar la versión anterior.
SELECT id, data AS datos_anteriores FROM public.projects WHERE id = 'project_hacienda_f22';

WITH source AS (
  SELECT data, $names${"ZONA SOCIAL":"Zona piscina","BBQ":"Kiosco","SALA":"Sala","COCINA_1":"Cocina","ESTUDIO":"Estudio","ESCALERAS":"Escaleras","PASILLO 2P":"Pasillo del segundo piso","SALA TV":"Sala de TV","HAB PPAL 1":"Habitación principal","VESTIER":"Vestier","WCPPAL":"Baño principal","HAB AUX":"Habitación auxiliar"}$names$::jsonb AS names
  FROM public.projects WHERE id = 'project_hacienda_f22'
), named_rooms AS (
  SELECT r.key, r.value, coalesce(source.names ->> upper(regexp_replace(replace(regexp_replace(split_part(r.value->>'imageUrl', '?', 1), '^.*/', ''), '%20', ' '), '[.][^.]+$', '')), 'Ambiente del recorrido') AS name
  FROM source, jsonb_each(CASE WHEN jsonb_typeof(source.data->'rooms') = 'object' THEN source.data->'rooms' ELSE '{}'::jsonb END) r
), rooms AS (
  SELECT coalesce(jsonb_object_agg(r.key,
    (r.value - 'area' - 'materials' - 'height') || jsonb_build_object(
      'name', r.name, 'description', 'Recorrido 360° de Hacienda Club F22: ' || lower(r.name) || '.',
      'hotspots', coalesce((SELECT jsonb_agg(h.value || jsonb_build_object('label', 'Ir a ' || coalesce((SELECT n.name FROM named_rooms n WHERE n.key = h.value->>'targetRoom'), 'otro ambiente')) ORDER BY h.ord)
        FROM jsonb_array_elements(CASE WHEN jsonb_typeof(r.value->'hotspots') = 'array' THEN r.value->'hotspots' ELSE '[]'::jsonb END) WITH ORDINALITY h(value, ord)), '[]'::jsonb)
    )), '{}'::jsonb) AS value
  FROM named_rooms r
), renders AS (
  SELECT coalesce(jsonb_agg(r.value || jsonb_build_object('title', 'Vista de Hacienda Club F22', 'description', 'Visualización arquitectónica de Hacienda Club F22.') ORDER BY r.ord), '[]'::jsonb) AS value
  FROM source, jsonb_array_elements(CASE WHEN jsonb_typeof(source.data->'renders') = 'array' THEN source.data->'renders' ELSE '[]'::jsonb END) WITH ORDINALITY r(value, ord)
)
UPDATE public.projects p
SET data = (p.data - 'bedrooms' - 'bathrooms' - 'parkingSpaces' - 'specs' - 'publicSpecs' - 'materials' - 'finishes')
  || $specs${
  "name": "HACIENDA CLUB F22",
  "areaBuilt": "592,09 m²",
  "areaLot": "644,00 m²",
  "categoryLabel": "Vivienda no VIS unifamiliar",
  "tagline": "Vivienda no VIS unifamiliar en el lote F22 de Hacienda Club, con 592,09 m² de construcción total sobre un lote de 644,00 m², distribuida en tres pisos.",
  "description": "Vivienda no VIS unifamiliar en el lote F22 de Hacienda Club, con 592,09 m² de construcción total sobre un lote de 644,00 m², distribuida en tres pisos.",
  "statusLabel": "Proyecto residencial",
  "technicalSpecs": {
    "revision": "f22-cuadro-areas-2026-11-03",
    "source": "Cuadro de áreas y cuadro de ocupaciones y cargas suministrados por el propietario",
    "typology": "Vivienda no VIS unifamiliar",
    "areas": {
      "lot": 644,
      "firstFloor": 223.78,
      "kiosk": 42.32,
      "poolZone": 56.96,
      "firstFloorTotal": 323.06,
      "secondFloor": 198.78,
      "thirdFloor": 70.25,
      "openArea": 320.94,
      "totalConstruction": 592.09
    },
    "indices": {
      "occupation": 0.41,
      "construction": 0.91
    },
    "occupancy": {
      "group": "Residencial",
      "subgroup": "R1",
      "exits": 2,
      "riskCategory": "I",
      "occupantLoad": 21
    }
  },
  "highlights": [
    "Primer piso: 223,78 m²",
    "Kiosco: 42,32 m²",
    "Zona piscina: 56,96 m²",
    "Segundo piso: 198,78 m²",
    "Tercer piso: 70,25 m²",
    "Área libre: 320,94 m²"
  ]
}$specs$::jsonb
  || jsonb_build_object('rooms', rooms.value, 'renders', renders.value)
FROM rooms, renders
WHERE p.id = 'project_hacienda_f22';

-- Corregir también los textos de los medios relacionales si existen.
UPDATE public.project_media
SET title = CASE WHEN type = 'render' THEN 'Vista de Hacienda Club F22' ELSE 'Plano de Hacienda Club F22' END,
    metadata = (coalesce(metadata, '{}'::jsonb) - 'area' - 'description')
      || jsonb_build_object('description', 'Visualización arquitectónica de Hacienda Club F22.')
WHERE project_id = 'project_hacienda_f22' AND type IN ('render', 'blueprint');

WITH levels(filename, name, area, description) AS (VALUES
  ('P1-1.png', 'Primer piso', '223,78 m²', 'Primer piso: 223,78 m² • Kiosco: 42,32 m² • Zona piscina: 56,96 m² • Total área primer piso: 323,06 m²'),
  ('P1-2.png', 'Segundo piso', '198,78 m²', 'Segundo piso: 198,78 m²'),
  ('P1-3.png', 'Tercer piso', '70,25 m²', 'Tercer piso: 70,25 m²')
)
UPDATE public.project_media m
SET title = 'Planta axonométrica • ' || levels.name,
    metadata = coalesce(m.metadata, '{}'::jsonb) || jsonb_build_object('level', levels.name, 'area', levels.area, 'description', levels.description)
FROM levels
WHERE m.project_id = 'project_hacienda_f22' AND m.type = 'blueprint'
  AND regexp_replace(split_part(m.storage_path, '?', 1), '^.*/', '') = levels.filename;

COMMIT;

SELECT id, data->>'areaBuilt' AS construccion_total, data->>'areaLot' AS lote,
  data->'technicalSpecs' AS especificaciones, published_for_client AS publicado
FROM public.projects WHERE id = 'project_hacienda_f22';
