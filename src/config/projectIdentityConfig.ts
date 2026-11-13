/**
 * Configuración de Identidad Visual para Proyectos MASSA
 * Cada proyecto cuenta con su propia identidad cromática, tipográfica y de recursos
 * para sentirse como una nueva web independiente al abrirse en una pestaña nueva.
 */

import { F22_AREA_BUILT, F22_LOT_AREA, F22_SUMMARY, F22_LEVELS, HACIENDA_F22_TECHNICAL, type ProjectTechnicalSpecs } from '../data/haciendaF22Specs';
import { A14_AREA_BUILT, A14_LOT_AREA, IBIZA_A14_TECHNICAL } from '../data/ibizaA14Specs';
import amhoHorizontalWhiteInline from '../assets/branding/amho-horizontal-white.png?inline';
import amhoHorizontalDarkInline from '../assets/branding/amho-horizontal-dark.png?inline';
import amhoVerticalWhiteInline from '../assets/branding/amho-vertical-white.png?inline';
import amhoVerticalDarkInline from '../assets/branding/amho-vertical-dark.png?inline';
import amhoIconInline from '../assets/branding/amho-icon.png?inline';
import massaLogoInline from '../assets/branding/massa-uso.png?inline';
import massaCubeInline from '../assets/branding/massa-cube-transparent.png?inline';

export interface ProjectTheme {
  primaryColor: string;     // Color de acento primario (ej. #9CD01A o #DFC47B)
  primaryHover: string;     // Color hover de acento (ej. #ABDE24 o #F1E29B)
  accentGlow: string;       // Resplandor / sombra ambiental
  bgColor: string;          // Fondo base profundo
  surfaceColor: string;     // Color de paneles / tarjetas de cristal
  borderColor: string;      // Bordes de interfaz
  badgeBg: string;          // Fondo de la píldora de obra
  badgeText: string;        // Color de texto de la píldora de obra
  fontFamilyTitle: string;  // Tipografía para el título monumental
  fontFamilyBody: string;   // Tipografía de lectura
}

export interface ProjectRender {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface ClientBrandConfig {
  companyName: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  logoHorizontalWhite: string;
  logoHorizontalDark: string;
  logoVerticalWhite: string;
  logoVerticalDark: string;
  logoIcon: string;
  metallicGradient: string;
}

export interface ProjectLevelInfo {
  id: string;
  label: string;
  area: string;
  height: string;
  summary: string;
  spaces: string[];
}

export interface ProjectHotspot360 {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  targetRoomId?: string;
}

export interface ProjectRoom360 {
  id: string;
  name: string;
  level: string;
  area: string;
  materials: string;
  previewUrl: string;
  hotspots: ProjectHotspot360[];
}

export interface ProjectModel3DConfig {
  modelUrl: string;
  modelFileName: string;
  compression: string;
  fileSize: string;
  animationsCount: number;
  animationsLabel: string;
  features: string[];
  description: string;
}

export interface ProjectIdentity {
  id: string;
  slug: string;
  code: string;             // Ej: 'F22' o 'A14'
  name: string;             // Ej: 'HACIENDA CLUB F22' o 'IBIZA A14'
  titlePrefix: string;      // Ej: 'HACIENDA' o 'IBIZA'
  titleHighlight: string;   // Ej: 'F22' o 'A14'
  categoryLabel: string;    // Ej: 'RESIDENCIA CAMPESTRE DE AUTOR'
  urbanization: string;     // Ej: 'CONDOMINIO HACIENDA' o 'CONDOMINIO IBIZA'
  lot: string;              // Ej: 'LOTE F22' o 'LOTE A14'
  location: string;         // Ej: 'CÚCUTA / NORTE DE SANTANDER'
  locationFull: string;     // Ej: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22'
  statusBadge: string;      // Ej: 'AMHO CONSTRUCCIONES • OBRA EXCLUSIVA'
  statusLabel: string;      // Ej: 'Diseño Aprobado • Listo para Construcción'
  brandName: string;        // Ej: 'AMHO CONSTRUCCIONES' o 'MASSA HOME'
  tagline: string;          // Breve memoria conceptual
  heroVideoUrl: string;     // Video horizontal principal; vacío muestra el espacio reservado
  heroVideoPoster?: string; // Poster o fallback del video
  theme: ProjectTheme;
  clientBrand?: ClientBrandConfig;
  specs: {
    areaBuilt: string;
    lotArea: string;
    lotMetricValue?: string;
    suitesLabel?: string;
    wellnessLabel?: string;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    modality: string;
    levels: string;
  };
  technicalSpecs?: ProjectTechnicalSpecs;
  tourEmbedUrl?: string;    // URL para incrustar el Gemelo Digital 360°
  model3dUrl?: string;      // URL del archivo .glb/.gltf del modelo 3D interactivo
  model3dConfig?: ProjectModel3DConfig;
  renders: ProjectRender[];
  levels?: ProjectLevelInfo[];
  rooms360?: ProjectRoom360[];
}

// Colección completa de los 33 renders arquitectónicos de HACIENDA CLUB F22 con proporciones nativas exactas
export const HACIENDA_F22_RENDERS: ProjectRender[] = [
  // 1. FACHADAS & EXTERIORES (8)
  {
    id: 'f22-fachada-dron',
    title: "Vista aérea",
    url: '/HACIENDA F22/FACHADA DRON.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-fachada-1',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-2',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA 2.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-3',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA 3.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-1',
    title: "Fachada nocturna",
    url: '/HACIENDA F22/FACHADA NOCHE.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1446,
    height: 1088,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-2',
    title: "Fachada nocturna",
    url: '/HACIENDA F22/FACHADA NOCHE 2.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-trasera-1',
    title: "Fachada posterior",
    url: '/HACIENDA F22/FACHADA TRASERA.jpg',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-trasera-2',
    title: "Fachada posterior",
    url: '/HACIENDA F22/FACHADA TRASERA 2.jpg',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1619,
    height: 971,
    aspectRatio: 1.67
  },

  // 2. BIENVENIDA & SALÓN DOBLE ALTURA (5)
  {
    id: 'f22-vestibulo-1',
    title: "Vestíbulo",
    url: '/HACIENDA F22/VESTIBULO.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestibulo-2',
    title: "Vestíbulo",
    url: '/HACIENDA F22/VESTIBULO 2.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-1',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1671,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-2',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA 2.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-3',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA 3.png',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  },

  // 3. COCINA DE AUTOR (3)
  {
    id: 'f22-cocina-1',
    title: "Cocina",
    url: '/HACIENDA F22/COCINA.jpg',
    category: "Cocina de Autor",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-cocina-2',
    title: "Cocina",
    url: '/HACIENDA F22/COCINA 2.jpg',
    category: "Cocina de Autor",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-cocina-3',
    title: "Cocina",
    url: '/HACIENDA F22/COCINA 3.jpg',
    category: "Cocina de Autor",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },

  // 4. PISCINA & BBQ (4)
  {
    id: 'f22-piscina-1',
    title: "Piscina",
    url: '/HACIENDA F22/PISCINA.jpg',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-piscina-2',
    title: "Piscina",
    url: '/HACIENDA F22/PISCINA 2.jpg',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-1',
    title: "Terraza y kiosco",
    url: '/HACIENDA F22/TERRAZA.png',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-2',
    title: "Terraza y kiosco",
    url: '/HACIENDA F22/TERRAZA 2.jpg',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },

  // 5. ENTRETENIMIENTO & HOME OFFICE (4)
  {
    id: 'f22-tv-1',
    title: "Sala de TV",
    url: '/HACIENDA F22/SALA TV.jpg',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-2',
    title: "Sala de TV",
    url: '/HACIENDA F22/SALA TV 2.jpg',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-3',
    title: "Sala de TV",
    url: '/HACIENDA F22/SALA TV 3.png',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1114,
    aspectRatio: 1.13
  },
  {
    id: 'f22-oficina-1',
    title: "Estudio",
    url: '/HACIENDA F22/OFICINA.jpg',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },

  // 6. SUITES PRIVADAS, VESTIER & BAÑOS SPA (9)
  {
    id: 'f22-dormitorio-1',
    title: "Habitación principal",
    url: '/HACIENDA F22/DORMITORIO.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1522,
    height: 1033,
    aspectRatio: 1.47
  },
  {
    id: 'f22-dormitorio-2',
    title: "Habitación principal",
    url: '/HACIENDA F22/DORMITORIO 2.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-habitacion-1',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-habitacion-2',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION 2.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-habitacion-3',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION 3.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestier-1',
    title: "Vestier",
    url: '/HACIENDA F22/VESTIER.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 941,
    height: 1672,
    aspectRatio: 0.56 // Vertical / Portrait
  },
  {
    id: 'f22-bano-1',
    title: "Baño",
    url: '/HACIENDA F22/BANO.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-bano-2',
    title: "Baño",
    url: '/HACIENDA F22/BANO 2.png',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  },
  {
    id: 'f22-bano-3',
    title: "Baño",
    url: '/HACIENDA F22/BANO 3.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda Club F22.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  }
];

export const HACIENDA_F22_LEVELS: ProjectLevelInfo[] = F22_LEVELS.map(level => ({ id: level.id, label: level.name, area: level.area, height: '', summary: level.role, spaces: level.spaces }));

export const HACIENDA_F22_ROOMS_360: ProjectRoom360[] = [
  {
    "id": "room_f22_zona_social",
    "name": "Zona piscina",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/ZONA SOCIAL.jpg",
    "hotspots": [
      {
        "id": "hs-zs-2",
        "label": "Ir a Kiosco",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 22,
        "y": 52,
        "targetRoomId": "room_f22_bbq"
      },
      {
        "id": "hs-zs-3",
        "label": "Ir a Sala",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 74,
        "y": 52,
        "targetRoomId": "room_f22_sala"
      }
    ]
  },
  {
    "id": "room_f22_bbq",
    "name": "Kiosco",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/BBQ.jpg",
    "hotspots": [
      {
        "id": "hs-bbq-2",
        "label": "Ir a Zona piscina",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 52,
        "y": 60,
        "targetRoomId": "room_f22_zona_social"
      },
      {
        "id": "hs-bbq-3",
        "label": "Ir a Sala",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 28,
        "y": 48,
        "targetRoomId": "room_f22_sala"
      }
    ]
  },
  {
    "id": "room_f22_sala",
    "name": "Sala",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/SALA.jpg",
    "hotspots": [
      {
        "id": "hs-s-2",
        "label": "Ir a Cocina",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 20,
        "y": 52,
        "targetRoomId": "room_f22_cocina"
      },
      {
        "id": "hs-s-3",
        "label": "Ir a Escaleras",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 62,
        "y": 46,
        "targetRoomId": "room_f22_escaleras"
      },
      {
        "id": "hs-s-4",
        "label": "Ir a Estudio",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 32,
        "y": 50,
        "targetRoomId": "room_f22_estudio"
      },
      {
        "id": "hs-s-5",
        "label": "Ir a Zona piscina",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 82,
        "y": 52,
        "targetRoomId": "room_f22_zona_social"
      }
    ]
  },
  {
    "id": "room_f22_cocina",
    "name": "Cocina",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/COCINA_1.jpg",
    "hotspots": [
      {
        "id": "hs-c-3",
        "label": "Ir a Sala",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 42,
        "y": 48,
        "targetRoomId": "room_f22_sala"
      },
      {
        "id": "hs-c-4",
        "label": "Ir a Zona piscina",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 74,
        "y": 50,
        "targetRoomId": "room_f22_zona_social"
      }
    ]
  },
  {
    "id": "room_f22_estudio",
    "name": "Estudio",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/ESTUDIO.jpg",
    "hotspots": [
      {
        "id": "hs-est-3",
        "label": "Ir a Sala",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 88,
        "y": 52,
        "targetRoomId": "room_f22_sala"
      }
    ]
  },
  {
    "id": "room_f22_escaleras",
    "name": "Escaleras",
    "level": "Planta Nivel 1",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/ESCALERAS.jpg",
    "hotspots": [
      {
        "id": "hs-esc-2",
        "label": "Ir a Pasillo del segundo piso",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 50,
        "y": 32,
        "targetRoomId": "room_f22_pasillo"
      },
      {
        "id": "hs-esc-3",
        "label": "Ir a Sala",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 22,
        "y": 60,
        "targetRoomId": "room_f22_sala"
      }
    ]
  },
  {
    "id": "room_f22_pasillo",
    "name": "Pasillo del segundo piso",
    "level": "Planta Nivel 2",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/PASILLO 2P.jpg",
    "hotspots": [
      {
        "id": "hs-pas-2",
        "label": "Ir a Sala de TV",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 24,
        "y": 48,
        "targetRoomId": "room_f22_sala_tv"
      },
      {
        "id": "hs-pas-3",
        "label": "Ir a Habitación principal",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 50,
        "y": 44,
        "targetRoomId": "room_f22_master"
      },
      {
        "id": "hs-pas-4",
        "label": "Ir a Habitación auxiliar",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 78,
        "y": 48,
        "targetRoomId": "room_f22_hab_aux"
      },
      {
        "id": "hs-pas-5",
        "label": "Ir a Escaleras",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 68,
        "y": 62,
        "targetRoomId": "room_f22_escaleras"
      }
    ]
  },
  {
    "id": "room_f22_sala_tv",
    "name": "Sala de TV",
    "level": "Planta Piso 3",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/SALA TV.jpg",
    "hotspots": [
      {
        "id": "hs-tv-3",
        "label": "Ir a Pasillo del segundo piso",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 84,
        "y": 52,
        "targetRoomId": "room_f22_pasillo"
      },
      {
        "id": "hs-tv-4",
        "label": "Ir a Habitación principal",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 22,
        "y": 48,
        "targetRoomId": "room_f22_master"
      }
    ]
  },
  {
    "id": "room_f22_master",
    "name": "Habitación principal",
    "level": "Planta Nivel 2",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/HAB PPAL 1.jpg",
    "hotspots": [
      {
        "id": "hs-m-3",
        "label": "Ir a Vestier",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 82,
        "y": 50,
        "targetRoomId": "room_f22_vestier"
      },
      {
        "id": "hs-m-4",
        "label": "Ir a Pasillo del segundo piso",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 88,
        "y": 56,
        "targetRoomId": "room_f22_pasillo"
      }
    ]
  },
  {
    "id": "room_f22_vestier",
    "name": "Vestier",
    "level": "Planta Nivel 2",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/VESTIER.jpg",
    "hotspots": [
      {
        "id": "hs-v-3",
        "label": "Ir a Baño principal",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 50,
        "y": 48,
        "targetRoomId": "room_f22_wc_ppal"
      },
      {
        "id": "hs-v-4",
        "label": "Ir a Habitación principal",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 38,
        "y": 54,
        "targetRoomId": "room_f22_master"
      }
    ]
  },
  {
    "id": "room_f22_wc_ppal",
    "name": "Baño principal",
    "level": "Planta Nivel 2",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/WCPPAL.jpg",
    "hotspots": [
      {
        "id": "hs-wc-4",
        "label": "Ir a Vestier",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 42,
        "y": 48,
        "targetRoomId": "room_f22_vestier"
      }
    ]
  },
  {
    "id": "room_f22_hab_aux",
    "name": "Habitación auxiliar",
    "level": "Planta Nivel 2",
    "area": "",
    "materials": "",
    "previewUrl": "/HACIENDA F22/360/HAB AUX.jpg",
    "hotspots": [
      {
        "id": "hs-aux-3",
        "label": "Ir a Pasillo del segundo piso",
        "detail": "Cambiar de ambiente en el recorrido 360°.",
        "x": 88,
        "y": 50,
        "targetRoomId": "room_f22_pasillo"
      }
    ]
  }
];

// Colección completa de los 24 renders arquitectónicos oficiales de IBIZA A14 en alta resolución
export const IBIZA_A14_RENDERS: ProjectRender[] = [
  // 1. FACHADAS & EXTERIORES (5)
  {
    id: 'a14-fachada-1',
    title: 'Fachada Principal & Volumetría Bioclimática',
    url: '/IBIZA A14/01-F004.jpg',
    category: 'Fachada & Exteriores',
    description: 'Composición arquitectónica horizontal con generosos aleros de control solar y materiales nobles en Condominio Ibiza.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-2',
    title: 'Perspectiva Frontal & Aleros de Sombra',
    url: '/IBIZA A14/02-F005.jpg',
    category: 'Fachada & Exteriores',
    description: 'Diálogo entre volúmenes en voladizo, celosías de protección térmica e integración bioclimática con el paisaje.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-piscina-1',
    title: 'Piscina & Terraza Social Exterior',
    url: '/IBIZA A14/03-F006.jpg',
    category: 'Piscina & BBQ',
    description: 'Oasis exterior con solárium húmedo, espejo de agua cristalina y conexión fluida hacia los salones interiores.',
    width: 4096,
    height: 2312,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-3',
    title: 'Atrio de Entrada & Paisajismo',
    url: '/IBIZA A14/04-F007.jpg',
    category: 'Fachada & Exteriores',
    description: 'Pórtico de recibo con muros en piedra natural, vegetación tropical y control solar pasivo.',
    width: 3340,
    height: 1882,
    aspectRatio: 1.77
  },
  {
    id: 'a14-fachada-4',
    title: 'Fachada Posterior & Jardín Perimetral',
    url: '/IBIZA A14/05-F12.jpg',
    category: 'Fachada & Exteriores',
    description: 'Perspectiva monumental posterior con grandes paños acristalados de piso a techo y voladizos protectores.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  },

  // 2. BIENVENIDA & SALÓN (2)
  {
    id: 'a14-salon-1',
    title: 'Gran Salón Social & Ventanales Panorámicos',
    url: '/IBIZA A14/06-S2.jpg',
    category: 'Bienvenida & Salón',
    description: 'Espacio diáfano principal con ventilación bioclimática cruzada y apertura total hacia el jardín.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  },
  {
    id: 'a14-salon-2',
    title: 'Salón Principal & Comedor Integrado',
    url: '/IBIZA A14/07-S1.jpg',
    category: 'Bienvenida & Salón',
    description: 'Integración espacial de sala y comedor con mobiliario contemporáneo e iluminación arquitectónica lineal.',
    width: 4096,
    height: 2316,
    aspectRatio: 1.77
  },

  // 3. COCINA DE AUTOR (2)
  {
    id: 'a14-cocina-1',
    title: 'Cocina de Chef con Isla Central',
    url: '/IBIZA A14/08-C01.jpg',
    category: 'Cocina de Autor',
    description: 'Cocina de alto estándar con isla monolítica, acabados de poro cerrado y barra social conectada al exterior.',
    width: 4096,
    height: 2316,
    aspectRatio: 1.77
  },
  {
    id: 'a14-cocina-2',
    title: 'Cocina Gourmet & Conexión al Comedor',
    url: '/IBIZA A14/09-C02.jpg',
    category: 'Cocina de Autor',
    description: 'Diálogo armónico entre la zona gastronómica y las áreas sociales de la residencia.',
    width: 5376,
    height: 3040,
    aspectRatio: 1.77
  },

  // 4. MASTER SUITE & VESTIER (4)
  {
    id: 'a14-hp-1',
    title: 'Master Suite Principal • Vista General',
    url: '/IBIZA A14/10-HP1.jpg',
    category: 'Master Suite & Vestier',
    description: 'Suite principal con panelado en madera cálida, iluminación indirecta en cielo raso y amplitud visual.',
    width: 2688,
    height: 1500,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hp-2',
    title: 'Master Suite Principal • Cabecero & Iluminación',
    url: '/IBIZA A14/11-HP2.jpg',
    category: 'Master Suite & Vestier',
    description: 'Detalle interior de la Master Suite con texturas neutras, mobiliario a medida e iluminación cálida.',
    width: 1678,
    height: 937,
    aspectRatio: 1.79
  },
  {
    id: 'a14-vp-1',
    title: 'Vestier Principal • Carpintería e Isla',
    url: '/IBIZA A14/12-VP1.jpg',
    category: 'Master Suite & Vestier',
    description: 'Walk-in closet de lujo con vitrinas iluminadas, isla central y acabados en madera natural.',
    width: 2752,
    height: 1536,
    aspectRatio: 1.79
  },
  {
    id: 'a14-vp-2',
    title: 'Vestier Principal • Detalle de Acabados',
    url: '/IBIZA A14/13-VP2.jpg',
    category: 'Master Suite & Vestier',
    description: 'Perspectiva del vestier principal con módulo organizador central, iluminación LED integrada y espejo de cuerpo entero.',
    width: 2400,
    height: 1792,
    aspectRatio: 1.34
  },

  // 5. SUITES & HABITACIONES (10)
  {
    id: 'a14-ha-1',
    title: 'Habitación Auxiliar A • Vista Principal',
    url: '/IBIZA A14/14-HA1.jpg',
    category: 'Suites & Habitaciones',
    description: 'Suite secundaria con ventanales hacia terraza exterior, carpintería minimalista y ventilación cruzada.',
    width: 3358,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-ha-2',
    title: 'Habitación Auxiliar A • Apertura a Terraza',
    url: '/IBIZA A14/15-HA-2.jpg',
    category: 'Suites & Habitaciones',
    description: 'Habitación luminosa con salida directa a balcón y diseño interior contemporáneo de tonos serenos.',
    width: 4096,
    height: 2286,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hab-1',
    title: 'Suite Auxiliar • Mobiliario & Estudio',
    url: '/IBIZA A14/16-HAB-1.jpg',
    category: 'Suites & Habitaciones',
    description: 'Zona de descanso con clóset integrado, mueble de entretenimiento y escritorio funcional.',
    width: 3356,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hab-2',
    title: 'Baño Suite Auxiliar • Ducha & Acabados',
    url: '/IBIZA A14/17-HAB-2.jpg',
    category: 'Suites & Habitaciones',
    description: 'Baño privado con enchapes de gran formato, grifería contemporánea, espejo retroiluminado y cabina en vidrio templado.',
    width: 3356,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hb-1',
    title: 'Habitación B • Vista Panorámica',
    url: '/IBIZA A14/18-HB-1.jpg',
    category: 'Suites & Habitaciones',
    description: 'Habitación secundaria con acentos cálidos, cabecero tapizado y ventanal amplio hacia el entorno exterior.',
    width: 3356,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hb-2',
    title: 'Habitación B • Cabecero & Vestidor',
    url: '/IBIZA A14/19-HB-2.jpg',
    category: 'Suites & Habitaciones',
    description: 'Perspectiva interior de la Habitación B con iluminación ambiental y mobiliario de autor.',
    width: 3333,
    height: 1861,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hc-1',
    title: 'Habitación C • Perspectiva Interior',
    url: '/IBIZA A14/20-HC-1.jpg',
    category: 'Suites & Habitaciones',
    description: 'Suite con listonería en madera vertical, iluminación indirecta y conexión visual al paisaje.',
    width: 3358,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hc-4',
    title: 'Habitación C • Balcón & Visual Exterior',
    url: '/IBIZA A14/21-HC-4.jpg',
    category: 'Suites & Habitaciones',
    description: 'Vista hacia el balcón privado y jardines del Condominio Ibiza desde la Habitación C.',
    width: 3356,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hc-2',
    title: 'Habitación C • Vista hacia Ventanales',
    url: '/IBIZA A14/22-HC-2.jpg',
    category: 'Suites & Habitaciones',
    description: 'Encuadre interior hacia ventanales de piso a techo con protección solar de aleros.',
    width: 3358,
    height: 1874,
    aspectRatio: 1.79
  },
  {
    id: 'a14-hc-3',
    title: 'Habitación C • Conexión Exterior & Jardín',
    url: '/IBIZA A14/23-HC-3.jpg',
    category: 'Suites & Habitaciones',
    description: 'Integración espacial entre dormitorio, área de descanso y terraza privada.',
    width: 3358,
    height: 1874,
    aspectRatio: 1.79
  },

  // 6. CIRCULACIÓN & ESCALERAS (1)
  {
    id: 'a14-l1-1',
    title: 'Escalera Principal & Hall de Distribución',
    url: '/IBIZA A14/24-L1-1.jpg',
    category: 'Circulación & Escaleras',
    description: 'Circulación vertical en madera natural y baranda minimalista que articula el nivel social con las suites.',
    width: 3356,
    height: 1874,
    aspectRatio: 1.79
  }
];

export const IBIZA_A14_LEVELS: ProjectLevelInfo[] = [
  {
    id: 'a14-nivel-1',
    label: 'Planta Nivel 1 • Social & Bioclimática',
    area: '236,89 m² • Nivel Social',
    height: 'Doble altura en salón principal y pórtico',
    summary: 'Planta social concebida para el clima cálido de Cúcuta en el Condominio Ibiza (Lote A14), privilegiando la ventilación cruzada, aleros profundos de control solar e integración directa con terraza y piscina (59,32 m²).',
    spaces: [
      'Pórtico de ingreso monumental con jardines tropicales y espejo de agua',
      'Gran Salón-Comedor con apertura total hacia la terraza cubierta',
      'Cocina de autor con isla central y conexión funcional hacia zona BBQ',
      'Estudio / Suite de huéspedes en primer nivel con baño completo',
      'Piscina (59,32 m²) con playa húmeda, solárium y área libre de 463,11 m²',
      'Parqueadero cubierto para vehículos + zona de ropas y servicios'
    ]
  },
  {
    id: 'a14-nivel-2',
    label: 'Planta Nivel 2 • Suites & Descanso',
    area: '168,00 m² • Nivel Privado',
    height: 'Altura libre 3.10 m con protección solar',
    summary: 'Nivel íntimo residencial con circulación ventilada naturalmente, sala de estar familiar y suites con balcones profundos orientados hacia las visuales del Condominio Ibiza.',
    spaces: [
      'Master Suite Principal A14 con terraza privada y control lumínico',
      'Walk-in Closet de gran capacidad y baño principal con doble lavamanos',
      'Suites secundarias con baño privado, vestier y ventilación natural',
      'Family Room / Sala de TV íntima en segundo nivel'
    ]
  },
  {
    id: 'a14-nivel-3',
    label: 'Cubierta & Terrazas • Ingeniería Bioclimática',
    area: '264,10 m² • Cubierta & Aleros',
    height: 'Protección solar pasiva',
    summary: 'Sistema de cubierta proyectada con grandes voladizos perimetrales para mitigar la radiación solar directa y optimizar el confort térmico interior todo el año.',
    spaces: [
      'Aleros arquitectónicos en voladizo para sombra proyectada sobre fachadas',
      'Preinstalación técnica para energía solar fotovoltaica y climatización',
      'Aislamiento termoacústico de alto desempeño para máximo confort'
    ]
  }
];

export const IBIZA_A14_ROOMS_360: ProjectRoom360[] = [
  {
    id: 'a14-room-fachada',
    name: 'Acceso Principal & Fachada Ibiza A14',
    level: 'Planta Nivel 1 • Exterior',
    area: 'Lote A14 • Condominio Ibiza',
    materials: 'Concreto arquitectónico, aleros de protección solar, piedra natural y madera',
    previewUrl: '/IBIZA A14/01-F004.jpg',
    hotspots: [
      { id: 'a14-hs-1', label: 'Alero Bioclimático A14', detail: 'Voladizo diseñado para protección solar pasiva en el clima de Cúcuta.', x: 46, y: 38 },
      { id: 'a14-hs-2', label: 'Ingresar al Nivel Social', detail: 'Explorar Gran Salón & Terraza →', x: 55, y: 64, targetRoomId: 'a14-room-social' }
    ]
  },
  {
    id: 'a14-room-social',
    name: 'Gran Salón Social & Cocina Integrada',
    level: 'Planta Nivel 1 • Social',
    area: 'Zona Social Integrada',
    materials: 'Pisos de gran formato, carpintería arquitectónica y ventanales piso a techo',
    previewUrl: '/IBIZA A14/07-S1.jpg',
    hotspots: [
      { id: 'a14-hs-3', label: 'Salir a Terraza & Piscina', detail: 'Conectar con Oasis Exterior A14 →', x: 74, y: 58, targetRoomId: 'a14-room-piscina' },
      { id: 'a14-hs-4', label: 'Subir a Nivel de Suites', detail: 'Explorar Planta Nivel 2 →', x: 28, y: 42, targetRoomId: 'a14-room-master' }
    ]
  },
  {
    id: 'a14-room-piscina',
    name: 'Terraza Cubierta, Piscina & Zona BBQ',
    level: 'Planta Nivel 1 • Oasis Exterior',
    area: 'Exterior & Paisajismo',
    materials: 'Deck antideslizante, espejo de agua y pérgola de control solar',
    previewUrl: '/IBIZA A14/03-F006.jpg',
    hotspots: [
      { id: 'a14-hs-5', label: 'Piscina & Solárium', detail: 'Integración fluida con el salón y jardines del Lote A14.', x: 52, y: 70 },
      { id: 'a14-hs-6', label: 'Volver al Salón Social', detail: 'Regresar al Interior →', x: 24, y: 50, targetRoomId: 'a14-room-social' }
    ]
  },
  {
    id: 'a14-room-master',
    name: 'Master Suite A14 & Balcón Privado',
    level: 'Planta Nivel 2 • Privado',
    area: 'Suite Principal',
    materials: 'Maderas cálidas, iluminación indirecta y ventanales con quiebrasoles',
    previewUrl: '/IBIZA A14/10-HP1.jpg',
    hotspots: [
      { id: 'a14-hs-7', label: 'Balcón & Visuales Ibiza', detail: 'Vista abierta hacia el entorno campestre del Condominio Ibiza.', x: 65, y: 48 },
      { id: 'a14-hs-8', label: 'Regresar al Nivel 1', detail: 'Bajar al Gran Salón →', x: 22, y: 60, targetRoomId: 'a14-room-social' }
    ]
  }
];

// Registro oficial de identidades de proyecto
export const PROJECT_IDENTITIES: Record<string, ProjectIdentity> = {
  // PROYECTO 1: HACIENDA CLUB F22 (Identidad independiente White-Label para AMHO CONSTRUCCIONES)
  'project_hacienda_f22': {
    id: 'project_hacienda_f22',
    slug: 'hacienda-f22',
    code: 'F22',
    name: 'HACIENDA CLUB F22',
    titlePrefix: 'HACIENDA CLUB',
    titleHighlight: 'F22',
    categoryLabel: 'VIVIENDA NO VIS UNIFAMILIAR',
    urbanization: 'HACIENDA CLUB',
    lot: 'LOTE F22',
    location: 'VILLA DEL ROSARIO (BOCONÓ) / NORTE DE SANTANDER',
    locationFull: 'VILLA DEL ROSARIO (BOCONÓ) / NORTE DE SANTANDER • HACIENDA CLUB • LOTE F22',
    statusBadge: 'AMHO CONSTRUCCIONES • OBRA EXCLUSIVA',
    statusLabel: 'Proyecto residencial',
    brandName: 'AMHO CONSTRUCCIONES',
    tagline: F22_SUMMARY,
    heroVideoUrl: '/HACIENDA F22/HACIENDA CLUB F22.mp4',
    heroVideoPoster: '/HACIENDA F22/FACHADA.png',
    theme: {
      primaryColor: '#DFC47B',        // Oro champaña metálico oficial extraído del isotipo AMHO Construcciones
      primaryHover: '#F1E29B',        // Destello oro luminoso del bisel superior del logo AMHO
      accentGlow: 'rgba(223, 196, 123, 0.35)',
      bgColor: '#060608',             // Obsidiana profunda de contraste arquitectónico
      surfaceColor: 'rgba(14, 14, 19, 0.88)',
      borderColor: 'rgba(223, 196, 123, 0.28)',
      badgeBg: '#DFC47B',
      badgeText: '#060608',
      fontFamilyTitle: "'Inter', 'Helvetica Neue', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'AMHO CONSTRUCCIONES',
      shortName: 'AMHO',
      subtitle: 'ARQUITECTURA • INGENIERÍA • CONSTRUCCIÓN DE AUTOR',
      tagline: 'Excelencia constructiva, precisión estructural y diseño residencial de ultra-lujo.',
      logoHorizontalWhite: amhoHorizontalWhiteInline,
      logoHorizontalDark: amhoHorizontalDarkInline,
      logoVerticalWhite: amhoVerticalWhiteInline,
      logoVerticalDark: amhoVerticalDarkInline,
      logoIcon: amhoIconInline,
      metallicGradient: 'linear-gradient(135deg, #B89752 0%, #DFC47B 32%, #F7E8A8 50%, #D1B16B 74%, #9E7D3B 100%)'
    },
    specs: {
      areaBuilt: F22_AREA_BUILT,
      lotArea: F22_LOT_AREA,
      lotMetricValue: F22_LOT_AREA,
      modality: 'Vivienda no VIS unifamiliar',
      levels: '3 pisos'
    },
    technicalSpecs: HACIENDA_F22_TECHNICAL,
    renders: HACIENDA_F22_RENDERS,
    levels: HACIENDA_F22_LEVELS,
    rooms360: HACIENDA_F22_ROOMS_360,
    model3dUrl: '/models/proyecto2_constructivo_360.glb',
    model3dConfig: {
      modelUrl: '/models/proyecto2_constructivo_360.glb',
      modelFileName: 'proyecto2_constructivo_360.glb',
      compression: 'Draco 1.5.7 + Texturas WebP',
      fileSize: '10.4 MB',
      animationsCount: 13,
      animationsLabel: 'Giro 360° + Proceso Constructivo por Etapas',
      features: [
        'Rotador_General_Obra (360°)',
        'Etapa 2: Estructura y Muros',
        'Etapa 3 y 4: Cubierta y Acabados',
        'Modo Horizontal Obligatorio en Móvil',
      ],
      description:
        'Gemelo constructivo 3D animado de Hacienda Club F22 con giro orbital de 360° y secuencia evolutiva por etapas de obra: cimentación, estructura, cubierta y acabados.',
    }
  },

  // PROYECTO 2: IBIZA A14 (Obra 02 - Condominio Ibiza • Lote A14)
  'project_ibiza_a14': {
    id: 'project_ibiza_a14',
    slug: 'ibiza-a14',
    code: 'A14',
    name: 'IBIZA A14',
    titlePrefix: 'IBIZA',
    titleHighlight: 'A14',
    categoryLabel: 'VILLA CAMPESTRE DE AUTOR',
    urbanization: 'CONDOMINIO IBIZA',
    lot: 'LOTE A14',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO IBIZA • LOTE A14',
    statusBadge: 'MASSA HOME • 24 RENDERS 4K & VIDEO',
    statusLabel: 'En Preventa & Diseño • Portafolio Activo',
    brandName: 'MASSA HOME',
    tagline: 'Villa campestre de autor concebida para la luz y el clima de Cúcuta en el Condominio Ibiza • Lote A14. Volumetría horizontal con grandes aleros de protección solar, ventilación bioclimática pasiva e integración interior-exterior.',
    heroVideoUrl: '/A14.mp4',
    heroVideoPoster: '/IBIZA A14/01-F004.jpg',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#C2F23E',
      accentGlow: 'rgba(156, 208, 26, 0.32)',
      bgColor: '#070906',
      surfaceColor: 'rgba(14, 18, 14, 0.88)',
      borderColor: 'rgba(156, 208, 26, 0.26)',
      badgeBg: '#9CD01A',
      badgeText: '#060804',
      fontFamilyTitle: "'Inter', 'Helvetica Neue', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'MASSA HOME',
      shortName: 'MASSA',
      subtitle: 'ARQUITECTURA BIOCLIMÁTICA • INGENIERÍA • GEMELOS DIGITALES',
      tagline: 'Diseño residencial contemporáneo de alto estándar, confort térmico pasivo y precisión técnica en cada detalle.',
      logoHorizontalWhite: massaLogoInline,
      logoHorizontalDark: massaLogoInline,
      logoVerticalWhite: massaLogoInline,
      logoVerticalDark: massaLogoInline,
      logoIcon: massaCubeInline,
      metallicGradient: 'linear-gradient(135deg, #4E6E08 0%, #8EC115 16%, #E4FF8A 34%, #9CD01A 50%, #5F870A 66%, #DAFF6E 82%, #7CB010 100%)'
    },
    specs: {
      areaBuilt: A14_AREA_BUILT,
      lotArea: A14_LOT_AREA,
      lotMetricValue: A14_LOT_AREA,
      suitesLabel: '4 Suites',
      wellnessLabel: 'Piscina 59,32 m²',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'Vivienda unifamiliar de 2 niveles',
      levels: '2 Plantas + Cubierta'
    },
    technicalSpecs: IBIZA_A14_TECHNICAL,
    renders: IBIZA_A14_RENDERS,
    levels: IBIZA_A14_LEVELS,
    rooms360: IBIZA_A14_ROOMS_360,
    model3dUrl: '/models/modelo_animado_web_360.glb',
    model3dConfig: {
      modelUrl: '/models/modelo_animado_web_360.glb',
      modelFileName: 'modelo_animado_web_360.glb',
      compression: 'Draco 1.5.7 + Texturas WebP',
      fileSize: '4.2 MB',
      animationsCount: 3,
      animationsLabel: 'Giro 360° + Elevación Nivel 2 y Cubierta',
      features: [
        'Rotador_General_Obra (360°)',
        'Elevación Nivel 2 (+4.5m)',
        'Elevación Nivel 3 Cubierta (+9.0m)',
        'Modo Horizontal Obligatorio en Móvil',
      ],
      description:
        'Gemelo arquitectónico 3D interactivo exportado desde Blender 4.5 con giro orbital de 360° sincronizado y vista explosiva por niveles para inspeccionar el interior.',
    }
  },

  // PROYECTO 3: SEDE MARQUIMODA (Obra 03)
  'project_1782912175010': {
    id: 'project_1782912175010',
    slug: 'marquimoda',
    code: 'OBRA 03',
    name: 'SEDE MARQUIMODA',
    titlePrefix: 'SEDE',
    titleHighlight: 'MARQUIMODA',
    categoryLabel: 'SEDE CORPORATIVA & ATELIER',
    urbanization: 'DISTRITO EMPRESARIAL',
    lot: 'SECTOR INDUSTRIAL',
    location: 'VALLE DEL CAUCA',
    locationFull: 'VALLE DEL CAUCA • DISTRITO EMPRESARIAL • ATELIER DE ALTA COSTURA',
    statusBadge: 'TOUR 360° ACTIVO',
    statusLabel: 'En Obra • 78% Avance',
    brandName: 'MASSA HOME',
    tagline: 'Sede corporativa y atelier de alta costura con arquitectura bioclimática pasiva y fachada con lamas en aluminio anodizado.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '/images/projects/marquimoda_isometria.webp',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.3)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(23, 23, 23, 0.8)',
      borderColor: 'rgba(156, 208, 26, 0.3)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: '620 m²',
      lotArea: '800 m²',
      lotMetricValue: '800 m²',
      suitesLabel: 'Atelier VIP',
      wellnessLabel: 'Terraza Lounge',
      bedrooms: 0,
      bathrooms: 6,
      parkingSpaces: 8,
      modality: 'Inversión Comercial',
      levels: '2 Plantas + Atrio Central'
    },
    renders: []
  }
};

/**
 * Resuelve la identidad visual completa de un proyecto.
 * Si el proyecto fue creado dinámicamente o aún no tiene perfil estático,
 * sintetiza una identidad visual coherente y elegante con fallback defensivo.
 */
export function getProjectIdentity(idOrSlug?: string): ProjectIdentity {
  if (!idOrSlug) return PROJECT_IDENTITIES['project_hacienda_f22'];

  const normalized = idOrSlug.trim().toLowerCase();

  // Alias específicos conocidos (prioridad rápida)
  if (normalized === 'a14' || normalized === 'ibiza-a14' || normalized === 'ibiza_a14' || normalized.includes('ibiza') || normalized.includes('a14')) {
    return PROJECT_IDENTITIES['project_ibiza_a14'];
  }
  if (normalized === 'f22' || normalized === 'hacienda-f22' || normalized === 'hacienda_f22' || normalized.includes('hacienda') || normalized.includes('f22')) {
    return PROJECT_IDENTITIES['project_hacienda_f22'];
  }
  if (normalized.includes('marquimoda')) {
    return PROJECT_IDENTITIES['project_1782912175010'];
  }

  // Búsqueda directa por clave o propiedades
  if (PROJECT_IDENTITIES[idOrSlug]) return PROJECT_IDENTITIES[idOrSlug];

  for (const key of Object.keys(PROJECT_IDENTITIES)) {
    const item = PROJECT_IDENTITIES[key];
    if (
      item.id.toLowerCase() === normalized ||
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized ||
      normalized.includes(item.slug.toLowerCase()) ||
      normalized.includes(item.id.toLowerCase())
    ) {
      return item;
    }
  }

  // Identidad dinámica por defecto
  const cleanedTitle = idOrSlug
    .replace(/^project_/, '')
    .replace(/[_-]/g, ' ')
    .toUpperCase();

  const words = cleanedTitle.split(' ').filter(Boolean);
  const titlePrefix = words.length > 1 ? words.slice(0, -1).join(' ') : cleanedTitle;
  const titleHighlight = words.length > 1 ? words[words.length - 1] : 'VIP';

  return {
    id: idOrSlug,
    slug: idOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    code: 'OBRA',
    name: cleanedTitle,
    titlePrefix,
    titleHighlight,
    categoryLabel: 'RESIDENCIA DE AUTOR',
    urbanization: 'ZONA EXCLUSIVA',
    lot: 'LOTE PRIVADO',
    location: 'COLOMBIA',
    locationFull: `COLOMBIA • ZONA EXCLUSIVA • ${cleanedTitle}`,
    statusBadge: 'PROYECTO EN VIVO',
    statusLabel: 'En Desarrollo & Diseño',
    brandName: 'MASSA HOME',
    tagline: 'Residencia arquitectónica de autor con diseño bioclimático e ingeniería de precisión por MASSA HOME.',
    heroVideoUrl: '/VIDEO H4.mp4',
    theme: {
      primaryColor: '#9CD01A',
      primaryHover: '#ABDE24',
      accentGlow: 'rgba(156, 208, 26, 0.25)',
      bgColor: '#08090C',
      surfaceColor: 'rgba(18, 19, 24, 0.75)',
      borderColor: 'rgba(156, 208, 26, 0.20)',
      badgeBg: '#9CD01A',
      badgeText: '#000000',
      fontFamilyTitle: "'Syne', 'Montserrat', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    specs: {
      areaBuilt: 'Por definir m²',
      lotArea: 'Por definir',
      lotMetricValue: 'Por definir',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Piscina & BBQ',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'A consultar',
      levels: '2 Plantas'
    },
    renders: []
  };
}

/**
 * Abre el proyecto en una pestaña nueva con su URL dedicada,
 * conservando intacta la pestaña actual del portafolio.
 */
export function openProjectInNewTab(projectId: string) {
  const identity = getProjectIdentity(projectId);
  const targetSlug = identity.slug || identity.id || projectId;
  const url = `/proyecto/${encodeURIComponent(targetSlug)}`;
  if (typeof document !== 'undefined') {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  const newWin = window.open(url, '_blank');
  if (newWin) {
    newWin.opener = null;
  }
}

export interface ActiveProject3DModelItem {
  id: string;
  slug: string;
  name: string;
  titlePrefix: string;
  titleHighlight: string;
  location: string;
  previewImg: string;
  accentColor: string;
  isCustomBrand: boolean;
  modelUrl: string;
  modelFileName: string;
  viewerTabUrl: string;
  projectUrl: string;
  compression: string;
  fileSize: string;
  animationsCount: number;
  animationsLabel: string;
  features: string[];
  description: string;
}

/**
 * Resuelve si un proyecto cuenta actualmente con un modelo 3D (.glb/.gltf) activo.
 * Retorna `null` si la obra aún no tiene modelo 3D subido.
 * En cuanto se agregue `model3dUrl` o `model3dConfig` a cualquier obra (por código,
 * base de datos o panel de administración), retorna automáticamente su ficha 3D completa.
 */
export function resolveActiveProject3DModel(
  idOrSlug: string,
  remoteData?: {
    model3dUrl?: string | null;
    name?: string;
    location?: string;
    heroImage?: string;
    thumbnail?: string;
    description?: string;
  }
): ActiveProject3DModelItem | null {
  const identity = getProjectIdentity(idOrSlug);
  const effectiveModelUrl = (
    remoteData?.model3dUrl?.trim() ||
    identity.model3dConfig?.modelUrl?.trim() ||
    identity.model3dUrl?.trim() ||
    ''
  );

  if (!effectiveModelUrl) {
    return null;
  }

  const cfg = identity.model3dConfig;
  const fileNameFromUrl = effectiveModelUrl.split('/').pop()?.split('?')[0] || 'modelo_3d.glb';
  const isHacienda = identity.id === 'project_hacienda_f22';
  const previewImg =
    remoteData?.heroImage ||
    remoteData?.thumbnail ||
    identity.heroVideoPoster ||
    identity.renders[0]?.url ||
    (isHacienda ? '/HACIENDA F22/FACHADA 3.png' : '/IBIZA A14/01-F004.jpg');

  return {
    id: identity.id,
    slug: identity.slug,
    name: remoteData?.name || identity.name,
    titlePrefix: identity.titlePrefix,
    titleHighlight: identity.titleHighlight,
    location: remoteData?.location || identity.location,
    previewImg,
    accentColor: identity.theme.primaryColor || (isHacienda ? '#DFC47B' : '#9CD01A'),
    isCustomBrand: Boolean(identity.clientBrand && isHacienda),
    modelUrl: effectiveModelUrl,
    modelFileName: cfg?.modelFileName || fileNameFromUrl,
    viewerTabUrl: `/proyecto/${encodeURIComponent(identity.slug)}/3d`,
    projectUrl: `/proyecto/${encodeURIComponent(identity.slug)}`,
    compression: cfg?.compression || 'Draco 1.5.7 + Texturas WebP',
    fileSize: cfg?.fileSize || 'Optimizado WebGL',
    animationsCount: cfg?.animationsCount ?? 1,
    animationsLabel: cfg?.animationsLabel || 'Volumetría 3D Interactiva 360°',
    features: cfg?.features || [
      'Giro Orbital 360° Interactivo',
      'Inspección Volumétrica en Tiempo Real',
      'Modo Horizontal Obligatorio en Móvil',
    ],
    description:
      cfg?.description ||
      remoteData?.description ||
      identity.tagline,
  };
}
