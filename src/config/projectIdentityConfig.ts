/**
 * Configuración de Identidad Visual para Proyectos MASSA
 * Cada proyecto cuenta con su propia identidad cromática, tipográfica y de recursos
 * para sentirse como una nueva web independiente al abrirse en una pestaña nueva.
 */

import { F22_AREA_BUILT, F22_LOT_AREA, F22_SUMMARY, F22_LEVELS, HACIENDA_F22_TECHNICAL, type ProjectTechnicalSpecs } from '../data/haciendaF22Specs';

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

export interface ProjectIdentity {
  id: string;
  slug: string;
  code: string;             // Ej: 'F22' o 'A14'
  name: string;             // Ej: 'HACIENDA F22' o 'IBIZA A14'
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
  renders: ProjectRender[];
  levels?: ProjectLevelInfo[];
  rooms360?: ProjectRoom360[];
}

// Colección completa de los 33 renders arquitectónicos de HACIENDA F22 con proporciones nativas exactas
export const HACIENDA_F22_RENDERS: ProjectRender[] = [
  // 1. FACHADAS & EXTERIORES (8)
  {
    id: 'f22-fachada-dron',
    title: "Vista aérea",
    url: '/HACIENDA F22/FACHADA DRON.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-fachada-1',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-2',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA 2.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-3',
    title: "Fachada principal",
    url: '/HACIENDA F22/FACHADA 3.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1446,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-1',
    title: "Fachada nocturna",
    url: '/HACIENDA F22/FACHADA NOCHE.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1446,
    height: 1088,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-noche-2',
    title: "Fachada nocturna",
    url: '/HACIENDA F22/FACHADA NOCHE 2.png',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-fachada-trasera-1',
    title: "Fachada posterior",
    url: '/HACIENDA F22/FACHADA TRASERA.jpg',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-fachada-trasera-2',
    title: "Fachada posterior",
    url: '/HACIENDA F22/FACHADA TRASERA 2.jpg',
    category: "Fachada & Exteriores",
    description: 'Visualización arquitectónica de Hacienda F22.',
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
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestibulo-2',
    title: "Vestíbulo",
    url: '/HACIENDA F22/VESTIBULO 2.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-1',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1671,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-2',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA 2.jpg',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-sala-3',
    title: "Sala y comedor",
    url: '/HACIENDA F22/SALA 3.png',
    category: "Bienvenida & Salón",
    description: 'Visualización arquitectónica de Hacienda F22.',
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
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-cocina-2',
    title: "Cocina",
    url: '/HACIENDA F22/COCINA 2.jpg',
    category: "Cocina de Autor",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-cocina-3',
    title: "Cocina",
    url: '/HACIENDA F22/COCINA 3.jpg',
    category: "Cocina de Autor",
    description: 'Visualización arquitectónica de Hacienda F22.',
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
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-piscina-2',
    title: "Piscina",
    url: '/HACIENDA F22/PISCINA 2.jpg',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1447,
    height: 1087,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-1',
    title: "Terraza y kiosco",
    url: '/HACIENDA F22/TERRAZA.png',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-terraza-2',
    title: "Terraza y kiosco",
    url: '/HACIENDA F22/TERRAZA 2.jpg',
    category: "Piscina & BBQ",
    description: 'Visualización arquitectónica de Hacienda F22.',
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
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-2',
    title: "Sala de TV",
    url: '/HACIENDA F22/SALA TV 2.jpg',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-tv-3',
    title: "Sala de TV",
    url: '/HACIENDA F22/SALA TV 3.png',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1114,
    aspectRatio: 1.13
  },
  {
    id: 'f22-oficina-1',
    title: "Estudio",
    url: '/HACIENDA F22/OFICINA.jpg',
    category: "Entretenimiento & Estudio",
    description: 'Visualización arquitectónica de Hacienda F22.',
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
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1522,
    height: 1033,
    aspectRatio: 1.47
  },
  {
    id: 'f22-dormitorio-2',
    title: "Habitación principal",
    url: '/HACIENDA F22/DORMITORIO 2.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1254,
    height: 1254,
    aspectRatio: 1.00
  },
  {
    id: 'f22-habitacion-1',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1536,
    height: 1024,
    aspectRatio: 1.50
  },
  {
    id: 'f22-habitacion-2',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION 2.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-habitacion-3',
    title: "Habitación",
    url: '/HACIENDA F22/HABITACION 3.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1448,
    height: 1086,
    aspectRatio: 1.33
  },
  {
    id: 'f22-vestier-1',
    title: "Vestier",
    url: '/HACIENDA F22/VESTIER.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 941,
    height: 1672,
    aspectRatio: 0.56 // Vertical / Portrait
  },
  {
    id: 'f22-bano-1',
    title: "Baño",
    url: '/HACIENDA F22/BANO.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1672,
    height: 941,
    aspectRatio: 1.78
  },
  {
    id: 'f22-bano-2',
    title: "Baño",
    url: '/HACIENDA F22/BANO 2.png',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
    width: 1521,
    height: 1034,
    aspectRatio: 1.47
  },
  {
    id: 'f22-bano-3',
    title: "Baño",
    url: '/HACIENDA F22/BANO 3.jpg',
    category: "Habitaciones y baños",
    description: 'Visualización arquitectónica de Hacienda F22.',
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

// Colección completa de los 9 renders arquitectónicos oficiales de IBIZA A14 en resolución 4K/5K Widescreen
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
  }
];

export const IBIZA_A14_LEVELS: ProjectLevelInfo[] = [
  {
    id: 'a14-nivel-1',
    label: 'Planta Nivel 1 • Social & Bioclimática',
    area: 'Por definir m² • Nivel Social',
    height: 'Doble altura en salón principal y pórtico',
    summary: 'Planta social concebida para el clima cálido de Cúcuta en el Condominio Ibiza (Lote A14), privilegiando la ventilación cruzada, aleros profundos de control solar e integración directa con terraza y piscina.',
    spaces: [
      'Pórtico de ingreso monumental con jardines tropicales y espejo de agua',
      'Gran Salón-Comedor con apertura total hacia la terraza cubierta',
      'Cocina de autor con isla central y conexión funcional hacia zona BBQ',
      'Estudio / Suite de huéspedes en primer nivel con baño completo',
      'Piscina con playa húmeda, solárium y lounge bioclimático exterior',
      'Parqueadero cubierto para vehículos + zona de ropas y servicios'
    ]
  },
  {
    id: 'a14-nivel-2',
    label: 'Planta Nivel 2 • Suites & Descanso',
    area: 'Por definir m² • Nivel Privado',
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
    area: 'Cubierta Termoacústica & Aleros',
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
    previewUrl: '/IBIZA A14/06-S2.jpg',
    hotspots: [
      { id: 'a14-hs-7', label: 'Balcón & Visuales Ibiza', detail: 'Vista abierta hacia el entorno campestre del Condominio Ibiza.', x: 65, y: 48 },
      { id: 'a14-hs-8', label: 'Regresar al Nivel 1', detail: 'Bajar al Gran Salón →', x: 22, y: 60, targetRoomId: 'a14-room-social' }
    ]
  }
];

// Registro oficial de identidades de proyecto
export const PROJECT_IDENTITIES: Record<string, ProjectIdentity> = {
  // PROYECTO 1: HACIENDA F22 (Identidad independiente White-Label para AMHO CONSTRUCCIONES)
  'project_hacienda_f22': {
    id: 'project_hacienda_f22',
    slug: 'hacienda-f22',
    code: 'F22',
    name: 'HACIENDA F22',
    titlePrefix: 'HACIENDA',
    titleHighlight: 'F22',
    categoryLabel: 'VIVIENDA NO VIS UNIFAMILIAR',
    urbanization: 'CONDOMINIO HACIENDA',
    lot: 'LOTE F22',
    location: 'CÚCUTA / NORTE DE SANTANDER',
    locationFull: 'CÚCUTA / NORTE DE SANTANDER • CONDOMINIO HACIENDA • LOTE F22',
    statusBadge: 'AMHO CONSTRUCCIONES • OBRA EXCLUSIVA',
    statusLabel: 'Proyecto residencial',
    brandName: 'AMHO CONSTRUCCIONES',
    tagline: F22_SUMMARY,
    // Cuando esté listo el video oficial, colocar aquí su ruta o URL para activar el reproductor.
    heroVideoUrl: '',
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
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'AMHO CONSTRUCCIONES',
      shortName: 'AMHO',
      subtitle: 'ARQUITECTURA • INGENIERÍA • CONSTRUCCIÓN DE AUTOR',
      tagline: 'Excelencia constructiva, precisión estructural y diseño residencial de ultra-lujo.',
      logoHorizontalWhite: '/HACIENDA F22/branding/amho-horizontal-white.png',
      logoHorizontalDark: '/HACIENDA F22/branding/amho-horizontal-dark.png',
      logoVerticalWhite: '/HACIENDA F22/branding/amho-vertical-white.png',
      logoVerticalDark: '/HACIENDA F22/branding/amho-vertical-dark.png',
      logoIcon: '/HACIENDA F22/branding/amho-icon.png',
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
    rooms360: HACIENDA_F22_ROOMS_360
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
    statusBadge: 'MASSA HOME • 9 RENDERS 4K & VIDEO',
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
      fontFamilyTitle: "'Syne', 'Montserrat', 'Inter', sans-serif",
      fontFamilyBody: "'Inter', sans-serif"
    },
    clientBrand: {
      companyName: 'MASSA HOME',
      shortName: 'MASSA',
      subtitle: 'ARQUITECTURA BIOCLIMÁTICA • INGENIERÍA • GEMELOS DIGITALES',
      tagline: 'Diseño residencial contemporáneo de alto estándar, confort térmico pasivo y precisión técnica en cada detalle.',
      logoHorizontalWhite: '/MASSA_USO.png',
      logoHorizontalDark: '/MASSA_USO.png',
      logoVerticalWhite: '/MASSA_USO.png',
      logoVerticalDark: '/MASSA_USO.png',
      logoIcon: '/massa-cube-transparent.png',
      metallicGradient: 'linear-gradient(135deg, #729B0E 0%, #9CD01A 35%, #D4FF5E 52%, #8CBF14 76%, #5B7E08 100%)'
    },
    specs: {
      areaBuilt: 'Por definir m²',
      lotArea: 'Condominio Ibiza • Lote A14',
      lotMetricValue: 'Lote A14',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Piscina & BBQ',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'En Preventa & Diseño • Personalizable',
      levels: '2 Plantas + Terrazas'
    },
    renders: IBIZA_A14_RENDERS,
    levels: IBIZA_A14_LEVELS,
    rooms360: IBIZA_A14_ROOMS_360
  },

  // PROYECTO 3: RESIDENCIA JEJÉN (Obra 03)
  'project_1781963945215': {
    id: 'project_1781963945215',
    slug: 'edinson-jejen',
    code: 'OBRA 03',
    name: 'RESIDENCIA JEJÉN',
    titlePrefix: 'RESIDENCIA',
    titleHighlight: 'JEJÉN',
    categoryLabel: 'RESIDENCIA URBANA DE AUTOR',
    urbanization: 'CALI EXCLUSIVO',
    lot: 'LOTE 07',
    location: 'CALI / VALLE DEL CAUCA',
    locationFull: 'CALI / VALLE DEL CAUCA • CALI EXCLUSIVO • OBRA DE AUTOR',
    statusBadge: 'TOUR 360° EN VIVO',
    statusLabel: 'En Ejecución • 92% Avance',
    brandName: 'MASSA HOME',
    tagline: 'Casa contemporánea de triple altura con spa turco, ventanales motorizados y terraza rooftop con jacuzzi panorámico.',
    heroVideoUrl: '/VIDEO H4.mp4',
    heroVideoPoster: '/images/projects/edinson_jejen_terraza.jpg',
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
      areaBuilt: '420 m²',
      lotArea: '550 m²',
      lotMetricValue: '550 m²',
      suitesLabel: '4 Suites',
      wellnessLabel: 'Jacuzzi & Turco',
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 3,
      modality: 'Obra Privada',
      levels: '3 Niveles'
    },
    renders: []
  },

  // PROYECTO 4: SEDE MARQUIMODA (Obra 04)
  'project_1782912175010': {
    id: 'project_1782912175010',
    slug: 'marquimoda',
    code: 'OBRA 04',
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
  if (normalized.includes('jejen') || normalized.includes('edinson')) {
    return PROJECT_IDENTITIES['project_1781963945215'];
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
 * Abre el proyecto en una pestaña nueva con su URL dedicada.
 */
export function openProjectInNewTab(projectId: string) {
  const identity = getProjectIdentity(projectId);
  const targetSlug = identity.slug || identity.id || projectId;
  const url = `/proyecto/${encodeURIComponent(targetSlug)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
