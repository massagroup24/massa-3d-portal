import { F22_AREA_BUILT, F22_LOT_AREA, F22_SUMMARY, F22_HIGHLIGHTS } from './haciendaF22Specs';

export interface CommercialResidence {
  id: string;
  projectId?: string;
  name: string;
  tagline: string;
  category: 'vivienda' | 'comercial' | 'institucional' | 'industrial' | 'remodelación' | 'villa' | 'urbana' | 'penthouse' | 'corporativo';
  categoryLabel: string;
  location: string;
  zone: string;
  areaBuilt?: string;
  areaLot?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  priceCOP?: string;
  priceUSD?: string;
  status: 'disponible' | 'en_obra' | 'entregado';
  statusLabel: string;
  progressPercentage?: number;
  hasTour360: boolean;
  featured: boolean;
  heroImage: string;
  galleryImages: string[];
  highlights?: string[];
  description: string;
}

export const COMMERCIAL_RESIDENCES: CommercialResidence[] = [
  {
    id: 'project_hacienda_f22',
    projectId: 'project_hacienda_f22',
    name: 'HACIENDA CLUB F22',
    tagline: 'Vivienda unifamiliar de tres niveles en Hacienda Club, Villa del Rosario (Boconó), con 592,09 m² de construcción sobre un lote de 644,00 m².',
    category: 'vivienda',
    categoryLabel: 'Vivienda',
    location: 'Villa del Rosario (Boconó) / Norte de Santander',
    zone: 'Hacienda Club',
    areaBuilt: F22_AREA_BUILT,
    areaLot: F22_LOT_AREA,
    status: 'en_obra',
    statusLabel: 'En diseño',
    hasTour360: true,
    featured: true,
    heroImage: '/HACIENDA F22/FACHADA.png',
    galleryImages: [
      '/HACIENDA F22/FACHADA DRON.png',
      '/HACIENDA F22/FACHADA.png',
      '/HACIENDA F22/FACHADA 2.png',
      '/HACIENDA F22/FACHADA NOCHE.png',
      '/HACIENDA F22/SALA.jpg',
      '/HACIENDA F22/PISCINA.jpg',
      '/HACIENDA F22/COCINA.jpg',
      '/HACIENDA F22/DORMITORIO.jpg',
      '/HACIENDA F22/TERRAZA.png',
    ],
    highlights: F22_HIGHLIGHTS,
    description: F22_SUMMARY,
  },
  {
    id: 'project_ibiza_a14',
    projectId: 'project_ibiza_a14',
    name: 'Ibiza A14',
    tagline: 'Vivienda unifamiliar en Condominio Ibiza, Lote A14.',
    category: 'vivienda',
    categoryLabel: 'Vivienda',
    location: 'Cúcuta, Norte de Santander',
    zone: 'Condominio Ibiza',
    status: 'en_obra',
    statusLabel: 'En diseño',
    hasTour360: false,
    featured: true,
    heroImage: '/IBIZA A14/01-F004.jpg',
    galleryImages: [
      '/IBIZA A14/01-F004.jpg',
      '/IBIZA A14/02-F005.jpg',
      '/IBIZA A14/03-F006.jpg',
      '/IBIZA A14/04-F007.jpg',
      '/IBIZA A14/05-F12.jpg',
      '/IBIZA A14/06-S2.jpg',
      '/IBIZA A14/07-S1.jpg',
      '/IBIZA A14/08-C01.jpg',
      '/IBIZA A14/09-C02.jpg',
    ],
    description: 'Vivienda unifamiliar en Condominio Ibiza, Lote A14.',
  },
];
