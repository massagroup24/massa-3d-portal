import rawProjects from './projects.json';

export type ProjectTipo = 'vivienda' | 'comercial' | 'institucional' | 'industrial' | 'remodelación';
export type ProjectEstado = 'En diseño' | 'En ejecución' | 'Entregado';
export type ProjectAlcance = 'Diseño' | 'Construcción' | 'Diseño y construcción' | 'Remodelación' | 'Interventoría';

export interface ProjectGaleriaItem {
  url: string;
  tipo: 'render' | 'avance_de_obra' | 'obra_terminada';
  alt: string;
  fecha?: string;
}

export interface ProjectCredito {
  rol: string;
  nombre: string;
}

export interface CanonicalProject {
  id: string;
  nombre: string;
  slug: string;
  tipo: ProjectTipo;
  estado: ProjectEstado;
  año: number;
  ciudad: string;
  departamento: string;
  barrio_o_sector?: string;
  area_construida: number | null;
  area_lote?: number | null;
  numero_pisos?: number | null;
  numero_unidades?: number | null;
  habitaciones?: number | null;
  banos?: number | null;
  telefonos_contacto?: string[];
  alcance: ProjectAlcance;
  plazo?: string;
  sistema_constructivo?: string;
  cliente?: string;
  descripcion_corta: string;
  descripcion_larga?: string;
  creditos?: ProjectCredito[];
  imagen_principal: string;
  galeria: ProjectGaleriaItem[];
  video?: string;
  hasTour360: boolean;
}

export const CANONICAL_PROJECTS: CanonicalProject[] = rawProjects as CanonicalProject[];

export function getCanonicalProjectBySlugOrId(slugOrId: string): CanonicalProject | undefined {
  const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  // El nombre anterior sigue resolviendo el mismo proyecto para datos ya guardados.
  const legacyName = normalize(slugOrId);
  const normalized = legacyName === 'hacienda f22' ? 'hacienda club f22' : legacyName;
  return CANONICAL_PROJECTS.find(
    p => [p.id, p.slug, p.nombre].some(value => normalize(value) === normalized)
  );
}

export function formatAreaMetric(area: number | null | undefined): string | null {
  if (area === null || area === undefined || isNaN(area) || area <= 0) return null;
  return `${area.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;
}
