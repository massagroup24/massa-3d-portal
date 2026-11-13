import technical from './ibizaA14Technical.json';
import { formatArea, type ProjectTechnicalSpecs } from './haciendaF22Specs';

export const IBIZA_A14_TECHNICAL: ProjectTechnicalSpecs = technical;
export const A14_AREA_BUILT = formatArea(technical.areas.totalConstruction);
export const A14_LOT_AREA = formatArea(technical.areas.lot);
export const A14_SUMMARY = `Vivienda unifamiliar de 2 niveles en Ibiza Country House (Lote A14, ${technical.dimensions}), con ${A14_AREA_BUILT} de construcción total sobre un terreno de ${A14_LOT_AREA}.`;

export const A14_HIGHLIGHTS = [
  `Área de terreno: ${A14_LOT_AREA} (${technical.dimensions})`,
  `Primer piso: ${formatArea(technical.areas.firstFloor)}`,
  `Segundo piso: ${formatArea(technical.areas.secondFloor)}`,
  `Cubierta: ${formatArea(technical.areas.roof)}`,
  `Área libre: ${formatArea(technical.areas.openArea)}`,
  `Piscina: ${formatArea(technical.areas.pool)}`,
];

