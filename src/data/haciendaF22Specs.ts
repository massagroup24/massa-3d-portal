import technical from './haciendaF22Technical.json';
import type { Project, Room } from './tourData';

export type ProjectTechnicalSpecs = typeof technical;
export const HACIENDA_F22_TECHNICAL = technical;
export const formatTechnicalNumber = (value: number) => value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatArea = (value: number) => `${formatTechnicalNumber(value)} m²`;
export const F22_AREA_BUILT = formatArea(technical.areas.totalConstruction);
export const F22_LOT_AREA = formatArea(technical.areas.lot);
export const F22_SUMMARY = `Vivienda no VIS unifamiliar en el lote F22 de Hacienda Club, con ${F22_AREA_BUILT} de construcción total sobre un lote de ${F22_LOT_AREA}, distribuida en tres pisos.`;
export const F22_HIGHLIGHTS = [
  `Primer piso: ${formatArea(technical.areas.firstFloor)}`,
  `Kiosco: ${formatArea(technical.areas.kiosk)}`,
  `Zona piscina: ${formatArea(technical.areas.poolZone)}`,
  `Segundo piso: ${formatArea(technical.areas.secondFloor)}`,
  `Tercer piso: ${formatArea(technical.areas.thirdFloor)}`,
  `Área libre: ${formatArea(technical.areas.openArea)}`,
];

export const F22_LEVELS = [
  { id: 'nivel-1', name: 'Primer piso', area: formatArea(technical.areas.firstFloor), role: 'Áreas del primer piso', spaces: [
    `Primer piso: ${formatArea(technical.areas.firstFloor)}`,
    `Kiosco: ${formatArea(technical.areas.kiosk)}`,
    `Zona piscina: ${formatArea(technical.areas.poolZone)}`,
    `Total área primer piso: ${formatArea(technical.areas.firstFloorTotal)}`,
  ] },
  { id: 'nivel-2', name: 'Segundo piso', area: formatArea(technical.areas.secondFloor), role: 'Área del segundo piso', spaces: [`Segundo piso: ${formatArea(technical.areas.secondFloor)}`] },
  { id: 'nivel-3', name: 'Tercer piso', area: formatArea(technical.areas.thirdFloor), role: 'Área del tercer piso', spaces: [`Tercer piso: ${formatArea(technical.areas.thirdFloor)}`] },
];

// Nombres de navegación, sin atribuir a cada ambiente áreas o acabados no documentados.
export const F22_ROOM_NAMES: Record<string, string> = {
  'ZONA SOCIAL': 'Zona piscina', BBQ: 'Kiosco', SALA: 'Sala', COCINA_1: 'Cocina',
  ESTUDIO: 'Estudio', ESCALERAS: 'Escaleras', 'PASILLO 2P': 'Pasillo del segundo piso',
  'SALA TV': 'Sala de TV', 'HAB PPAL 1': 'Habitación principal', VESTIER: 'Vestier',
  WCPPAL: 'Baño principal', 'HAB AUX': 'Habitación auxiliar',
};

export function f22AssetName(url: string): string {
  try { return decodeURIComponent(url.split('?')[0].split('/').pop() || '').replace(/\.[^.]+$/, '').toUpperCase(); }
  catch { return ''; }
}

export function f22RenderTitle(url: string): string {
  const filename = f22AssetName(url);
  const group = filename.replace(/\s+\d+$/, '');
  const names: Record<string, string> = {
    'FACHADA DRON': 'Vista aérea', FACHADA: 'Fachada principal', 'FACHADA NOCHE': 'Fachada nocturna',
    'FACHADA TRASERA': 'Fachada posterior', VESTIBULO: 'Vestíbulo', SALA: 'Sala y comedor',
    COCINA: 'Cocina', PISCINA: 'Piscina', TERRAZA: 'Terraza y kiosco', 'SALA TV': 'Sala de TV',
    OFICINA: 'Estudio', DORMITORIO: 'Habitación principal', HABITACION: 'Habitación',
    VESTIER: 'Vestier', BANO: 'Baño', BAÑO: 'Baño',
  };
  return names[group] || 'Vista del proyecto';
}

// Se aplica solamente al F22 ya autorizado por la consulta. No añade proyectos
// al catálogo ni cambia publicación, imágenes, planos o conexiones del tour.
export function applyF22VerifiedSpecs(project: Project): Project {
  if (!['project_hacienda_f22', 'hacienda-f22'].includes(project.id)) return project;
  const rooms: Record<string, Room> = Object.fromEntries(Object.entries(project.rooms || {}).filter(([, room]) => room && typeof room === 'object').map(([id, room]) => {
    const name = F22_ROOM_NAMES[f22AssetName(room.imageUrl || '')] || 'Ambiente del recorrido';
    const { area: _area, materials: _materials, height: _height, ...navigation } = room as Room & { area?: unknown; materials?: unknown; height?: unknown };
    return [id, { ...navigation, name, description: `Recorrido 360° de Hacienda Club F22: ${name.toLowerCase()}.` }];
  }));
  for (const room of Object.values(rooms)) {
    room.hotspots = (room.hotspots || []).map(hotspot => ({ ...hotspot, label: `Ir a ${rooms[hotspot.targetRoom]?.name || 'otro ambiente'}` }));
  }
  const { bedrooms: _bedrooms, bathrooms: _bathrooms, parkingSpaces: _parking,
    specs: _specs, publicSpecs: _publicSpecs, materials: _materials, finishes: _finishes, ...rest
  } = project as Project & { specs?: unknown; publicSpecs?: unknown; materials?: unknown; finishes?: unknown };
  return {
    ...rest, name: 'HACIENDA CLUB F22', rooms, areaBuilt: F22_AREA_BUILT, areaLot: F22_LOT_AREA,
    categoryLabel: technical.typology, tagline: F22_SUMMARY, description: F22_SUMMARY,
    statusLabel: 'Proyecto residencial', technicalSpecs: technical, highlights: F22_HIGHLIGHTS,
    renders: project.renders?.map(render => ({ ...render, title: f22RenderTitle(render.storage_path), description: 'Visualización arquitectónica de Hacienda Club F22.' })),
  };
}

export function technicalRowGroups(specs: ProjectTechnicalSpecs) {
  const a = specs.areas;
  return [
    { title: 'Cuadro de áreas', rows: [
      ['Área total del lote', formatArea(a.lot)], ['Primer piso', formatArea(a.firstFloor)],
      ['Kiosco', formatArea(a.kiosk)], ['Zona piscina', formatArea(a.poolZone)],
      ['Total área primer piso', formatArea(a.firstFloorTotal)], ['Segundo piso', formatArea(a.secondFloor)],
      ['Tercer piso', formatArea(a.thirdFloor)], ['Área libre', formatArea(a.openArea)],
      ['Construcción total', formatArea(a.totalConstruction)],
    ] },
    { title: 'Índices', rows: [['Índice de ocupación', formatTechnicalNumber(specs.indices.occupation)], ['Índice de construcción', formatTechnicalNumber(specs.indices.construction)]] },
    { title: 'Ocupaciones y cargas', rows: [
      ['Grupo de ocupación', specs.occupancy.group], ['Subgrupo de ocupación', specs.occupancy.subgroup],
      ['Número de salidas', String(specs.occupancy.exits)], ['Categoría de riesgo', specs.occupancy.riskCategory],
      ['Carga ocupacional', String(specs.occupancy.occupantLoad)],
    ] },
  ];
}
