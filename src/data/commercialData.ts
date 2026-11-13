import { F22_AREA_BUILT, F22_LOT_AREA, F22_SUMMARY, F22_HIGHLIGHTS } from './haciendaF22Specs';
import { A14_AREA_BUILT, A14_LOT_AREA, A14_SUMMARY, A14_HIGHLIGHTS } from './ibizaA14Specs';

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
    id: 'project_ibiza_a14',
    projectId: 'project_ibiza_a14',
    name: 'Ibiza A14',
    tagline: 'Vivienda unifamiliar en Condominio Ibiza, Lote A14.',
    category: 'vivienda',
    categoryLabel: 'Vivienda',
    location: 'Cúcuta, Norte de Santander',
    zone: 'Condominio Ibiza',
    areaBuilt: A14_AREA_BUILT,
    areaLot: A14_LOT_AREA,
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
      '/IBIZA A14/10-HP1.jpg',
      '/IBIZA A14/11-HP2.jpg',
      '/IBIZA A14/12-VP1.jpg',
      '/IBIZA A14/13-VP2.jpg',
      '/IBIZA A14/14-HA1.jpg',
      '/IBIZA A14/15-HA-2.jpg',
      '/IBIZA A14/16-HAB-1.jpg',
      '/IBIZA A14/17-HAB-2.jpg',
      '/IBIZA A14/18-HB-1.jpg',
      '/IBIZA A14/19-HB-2.jpg',
      '/IBIZA A14/20-HC-1.jpg',
      '/IBIZA A14/21-HC-4.jpg',
      '/IBIZA A14/22-HC-2.jpg',
      '/IBIZA A14/23-HC-3.jpg',
      '/IBIZA A14/24-L1-1.jpg',
    ],
    highlights: A14_HIGHLIGHTS,
    description: A14_SUMMARY,
  },
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
    heroImage: '/HACIENDA F22/FACHADA 3.png',
    galleryImages: [
      '/HACIENDA F22/FACHADA 3.png',
      '/HACIENDA F22/FACHADA 2.png',
      '/HACIENDA F22/FACHADA DRON.png',
      '/HACIENDA F22/FACHADA.png',
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
];

export interface TrustedPartner {
  name: string;
  logo: string;
}

export const TRUSTED_PARTNERS_ROW1: TrustedPartner[] = [
  { name: 'Terpel', logo: '/logos/Logo_terpel.png' },
  { name: 'Dollarcity', logo: '/logos/dollarcity-logo.png' },
  { name: 'Faranda Hotels', logo: '/logos/SmciECr1.png' },
  { name: 'Construrama', logo: '/logos/construrama-logo-png_seeklogo-227227.png' },
  { name: 'Diomar García Eventos', logo: '/logos/logo.png' },
  { name: 'Clínica Santa Ana S.A.', logo: '/logos/MANEJO-DE-HERIDAS-1-2048.png' },
  { name: 'Palcasa', logo: '/logos/palcasa.png' },
  { name: 'Lukeoil Extractora', logo: '/logos/SOCIO-ALIANZA-LUKEOIL.webp' },
  { name: 'Synerflow', logo: '/logos/SYNERFLOW.png' },
  { name: 'Dubó', logo: '/logos/DUBO.png' },
  { name: 'Viwo Stay & Work', logo: '/logos/WhatsApp%20Image%202026-02-27%20at%2012.13.15%20PM.png' },
  { name: 'Leone', logo: '/logos/242022819_363586325461188_5883950162131200925_n.png' },
  { name: 'Río', logo: '/logos/800x800cc.png' },
  { name: 'Ingelcol S.A.', logo: '/logos/images.png' },
  { name: 'El Retén', logo: '/logos/elreten-ere-10.png' },
];

export const TRUSTED_PARTNERS_ROW2: TrustedPartner[] = [
  { name: 'Palnorte S.A.S.', logo: '/logos/305494681_483332970468358_205199070786225288_n.png' },
  { name: 'Grupo Surtitex S.A.', logo: '/logos/325779548_5942322762495612_7261240858182625003_n.png' },
  { name: 'Spezia', logo: '/logos/475437634_793270506329843_6136987787314938255_n.png' },
  { name: 'Tintorería La Roca', logo: '/logos/247902843_113607237774395_3371655457367365570_n.png' },
  { name: 'Skarcha', logo: '/logos/311566703_563704298870084_1384925464546808243_n.png' },
  { name: 'Decor Alvarez', logo: '/logos/313361047_555576386573302_2908882530352114794_n.png' },
  { name: 'Renew', logo: '/logos/368172010_649651340447686_6984167553677370507_n.png' },
  { name: "D'moda", logo: '/logos/376751772_685003803659632_6097670840865882095_n.png' },
  { name: 'Partcar', logo: '/logos/431894042_352105667815908_1191164120809286285_n.png' },
  { name: 'La María', logo: '/logos/462468849_122103669206559154_495338746926332711_n.png' },
  { name: 'Droguería Denach', logo: '/logos/463426875_561864616373222_4754960062164751279_n.png' },
  { name: 'Supermercado Alejandro', logo: '/logos/489381838_1608326783442259_6045952335802192271_n.png' },
  { name: 'Almacén Surtidor', logo: '/logos/1647346273-82-almac-n-surtidor.png' },
  { name: 'Surtidor', logo: '/logos/channels4_profile.png' },
  { name: 'Dark Rabbit', logo: '/logos/cropped-logo-dark-1.webp' },
];
