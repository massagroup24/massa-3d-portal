export interface Hotspot {
  id: string;
  position: [number, number, number];
  targetRoom: string; // The ID of the room this hotspot leads to
  label: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hotspots: Hotspot[];
  minimapPosition: { x: number; y: number };
}

export interface ProjectRenderItem {
  id: string;
  title: string;
  storage_path: string;
  category: 'Fachada' | 'Interiores' | 'Zonas Comunes' | 'Planos' | string;
  description?: string;
  order_index?: number;
}

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  minimapImage: string;
  initialRoomId: string;
  rooms: Record<string, Room>;
  pin?: string;
  status?: string; // 'disponible' | 'en_obra' | 'entregado' | 'preventa' | 'vendido'
  statusLabel?: string;
  clientName?: string;
  phase?: string;
  progress?: number;

  // Campos comerciales & editor para el portal público
  tagline?: string;
  category?: 'villa' | 'urbana' | 'penthouse' | 'corporativo' | string;
  categoryLabel?: string;
  location?: string;
  zone?: string;
  areaBuilt?: string;
  areaLot?: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  priceCOP?: string;
  priceUSD?: string;
  hasTour360?: boolean;
  featured?: boolean;
  heroImage?: string;
  galleryImages?: string[];
  highlights?: string[];
  renders?: ProjectRenderItem[];
  tourType?: '360_spheres' | 'matterport_iframe' | 'external_url';
  tourEmbedUrl?: string;
}

export const projectsData: Record<string, Project> = {
  'project_1781963945215': {
    id: 'project_1781963945215',
    name: 'RESIDENCIA JEJÉN',
    tagline: 'Casa contemporánea de triple altura con spa turco y terraza rooftop',
    category: 'urbana',
    categoryLabel: 'Residencia Urbana de Autor',
    location: 'Cali / Valle del Cauca',
    zone: 'Cali Exclusivo',
    areaBuilt: '420 m²',
    areaLot: '550 m²',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    priceCOP: 'Obra Privada',
    priceUSD: 'Proyecto Personalizado',
    status: 'en_obra',
    statusLabel: 'En Ejecución • 92% Avance',
    progress: 92,
    hasTour360: true,
    featured: true,
    heroImage: '/images/projects/edinson_jejen_terraza.jpg',
    thumbnail: '/images/projects/edinson_jejen_terraza.jpg',
    minimapImage: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/minimap-PLANO.jpg',
    initialRoomId: 'room_1',
    tourType: '360_spheres',
    highlights: [
      'Recorrido 360° en 5 ambientes con navegación interactiva',
      'Baño turco arquitectónico con revestimiento en piedra natural',
      'Sala social a triple altura con ventanales motorizados',
      'Gimnasio privado y terraza con jacuzzi en nivel superior'
    ],
    description: 'Ejemplo insignia de precisión constructiva MASSA. Cada detalle de iluminación, mármol y carpintería metálica fue diseñado de manera artesanal y digital.',
    galleryImages: [],
    renders: [],
    rooms: {
      room_1: {
        id: 'room_1',
        name: 'BAÑO V3',
        description: 'Punto de partida',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/room_1-Bano_V3.png',
        minimapPosition: { x: 72, y: 59 },
        hotspots: [
          {
            id: 'h_dwdkjzz',
            position: [-238.95, 58.88, -434.3],
            targetRoom: '____832',
            label: '3ER PISO SALA'
          }
        ]
      },
      ____832: {
        id: '____832',
        name: '3ER PISO 360',
        description: 'Nivel social superior con ventanales',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/____832-3ER_PISO_360.png',
        minimapPosition: { x: 70, y: 23 },
        hotspots: [
          {
            id: 'h_a1unmq3',
            position: [115.2, 1.37, -486.0],
            targetRoom: 'room_1',
            label: 'BAÑO V3'
          }
        ]
      },
      ____242: {
        id: '____242',
        name: 'BAÑO TURCO',
        description: 'Spa térmico revestido en piedra',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/____242-Bano_turco_360_2.png',
        minimapPosition: { x: 8, y: 47 },
        hotspots: []
      },
      ____98: {
        id: '____98',
        name: 'BAÑO TURCO 2',
        description: 'Zona de ducha y vapor',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/____98-Bano_turco_360_2.png',
        minimapPosition: { x: 53, y: 53 },
        hotspots: []
      },
      ____793: {
        id: '____793',
        name: 'Tercer Piso WC',
        description: 'Servicios sanitarios de lujo',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1781963945215/____793-Tercer_piso_WC_360.png',
        minimapPosition: { x: 75, y: 45 },
        hotspots: []
      }
    }
  },

  'project_1782912175010': {
    id: 'project_1782912175010',
    name: 'SEDE MARQUIMODA',
    tagline: 'Sede corporativa y atelier de alta costura con arquitectura bioclimática',
    category: 'corporativo',
    categoryLabel: 'Sede Corporativa & Oficinas',
    location: 'Valle del Cauca',
    zone: 'Distrito Empresarial',
    areaBuilt: '620 m²',
    areaLot: '800 m²',
    bedrooms: 0,
    bathrooms: 6,
    parkingSpaces: 8,
    priceCOP: 'Sede a Medida',
    priceUSD: 'Inversión Comercial',
    status: 'en_obra',
    statusLabel: 'En Obra • 78% Avance',
    progress: 78,
    hasTour360: true,
    featured: true,
    heroImage: '/images/projects/marquimoda_isometria.webp',
    thumbnail: '/images/projects/marquimoda_isometria.webp',
    minimapImage: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/minimap-ISOMETRIAS_.webp',
    initialRoomId: 'gerencia_pan_207',
    tourType: '360_spheres',
    highlights: [
      'Recorrido 360° por plantas abiertas y salas directivas',
      'Fachada con lamas móviles en aluminio anodizado',
      'Atrio central con jardín interior y luz cenital regulada',
      'Certificación de eficiencia energética y ahorro hídrico'
    ],
    description: 'Instalaciones de alto nivel para marcas que exigen proyectar solvencia, sofisticación e innovación espacial ante clientes y socios internacionales.',
    galleryImages: [],
    renders: [],
    rooms: {
      gerencia_pan_207: {
        id: 'gerencia_pan_207',
        name: 'ZONA DE TRABAJO',
        description: 'Open space de diseño colaborativo',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/gerencia_pan_207-Escena_5.webp',
        minimapPosition: { x: 33, y: 44 },
        hotspots: [
          {
            id: 'h_9pptp8g',
            position: [493.7, -27.48, 67.56],
            targetRoom: 'escena_11_240',
            label: 'Ir a Oficina Tipo'
          },
          {
            id: 'h_7ub7egq',
            position: [452.0, -207.7, 44.4],
            targetRoom: 'escena_10_893',
            label: 'Ir a Gerencia'
          },
          {
            id: 'h_9tz5rhs',
            position: [144.7, 336.8, 339.1],
            targetRoom: 'escena_13_692',
            label: 'Ir a pasillo segundo nivel'
          }
        ]
      },
      escena_8_270: {
        id: 'escena_8_270',
        name: 'CAFETERIA',
        description: 'Zona de descanso y café',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/escena_8_270-Escena_8.webp',
        minimapPosition: { x: 63, y: 50 },
        hotspots: [
          {
            id: 'h_2gx5rik',
            position: [381.2, -174.0, 271.6],
            targetRoom: 'escena_13_692',
            label: 'Ir al pasillo'
          }
        ]
      },
      escena_10_893: {
        id: 'escena_10_893',
        name: 'GERENCIA',
        description: 'Despacho directivo',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/escena_10_893-Escena_10_1.webp',
        minimapPosition: { x: 44, y: 52 },
        hotspots: [
          {
            id: 'h_0tzf5yk',
            position: [406.2, 2.85, -291.0],
            targetRoom: 'gerencia_pan_207',
            label: 'Ir a zona de trabajo'
          }
        ]
      },
      escena_11_240: {
        id: 'escena_11_240',
        name: 'OFICINA TIPO',
        description: 'Oficina ejecutiva',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/escena_11_240-Escena_11_1.webp',
        minimapPosition: { x: 40, y: 65 },
        hotspots: [
          {
            id: 'h_3nlkwap',
            position: [436.3, -39.4, 239.9],
            targetRoom: 'gerencia_pan_207',
            label: 'Ir a zona de trabajo'
          }
        ]
      },
      escena_12_427: {
        id: 'escena_12_427',
        name: 'OFICINA IMPORTACIONES',
        description: 'Oficina de operaciones internacionales',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/escena_12_427-Escena_12.webp',
        minimapPosition: { x: 85, y: 82 },
        hotspots: [
          {
            id: 'h_sadwu34',
            position: [158.4, -17.39, 473.2],
            targetRoom: 'escena_13_692',
            label: 'Ir a pasillo'
          }
        ]
      },
      escena_13_692: {
        id: 'escena_13_692',
        name: 'PASILLO 2 NIVEL',
        description: 'Circulación principal nivel superior',
        imageUrl: 'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/project_1782912175010/escena_13_692-Escena_13.webp',
        minimapPosition: { x: 73, y: 65 },
        hotspots: [
          {
            id: 'h_9pj234f',
            position: [491.8, -1.58, -85.8],
            targetRoom: 'escena_12_427',
            label: 'ir a la oficina'
          },
          {
            id: 'h_ocn82uz',
            position: [-235.3, -371.8, 235.9],
            targetRoom: 'gerencia_pan_207',
            label: 'Ir a zona de Trabajo'
          },
          {
            id: 'h_lfskdh9',
            position: [-493.3, 3.21, 76.2],
            targetRoom: 'escena_8_270',
            label: 'Ir a la cafeteria'
          }
        ]
      }
    }
  },

  'project_ibiza_a14': {
    id: 'project_ibiza_a14',
    name: 'IBIZA A14',
    tagline: 'Residencia de autor contemporánea en Condominio Ibiza • Lote A14',
    category: 'villa',
    categoryLabel: 'Villa Campestre de Autor',
    location: 'Cúcuta / Norte de Santander',
    zone: 'Condominio Ibiza • Lote A14',
    areaBuilt: 'Por definir m²',
    areaLot: 'Lote A14',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 3,
    priceCOP: 'A consultar',
    priceUSD: 'Inversión Personalizada',
    status: 'disponible',
    statusLabel: 'En Preventa & Diseño',
    progress: 15,
    hasTour360: true,
    featured: true,
    heroImage: '/IBIZA A14/01-F004.jpg',
    thumbnail: '/IBIZA A14/01-F004.jpg',
    minimapImage: '/PLANO.jpg', // Plano base para minimapa
    initialRoomId: 'room_ibiza_1',
    tourType: '360_spheres',
    highlights: [
      'Planos arquitectónicos y distribución espacial personalizada',
      'Renders fotorrealistas en alta definición',
      'Recorrido virtual 360° interactivo por todos los ambientes',
      'Ficha técnica y cuadro de acabados de lujo',
      'Ubicación privilegiada en Condominio Ibiza (Lote A14)',
      'Esquema de pago flexible por hitos de avance de obra'
    ],
    description: 'Exclusiva residencia diseñada a medida por MASSA GROUP en el prestigioso Condominio Ibiza. Espacio concebido para maximizar la ventilación bioclimática, la privacidad y el confort de alta gama.',
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
    renders: [
      {
        id: 'r_ibiza_1',
        title: 'Fachada Principal Bioclimática',
        storage_path: '/IBIZA A14/01-F004.jpg',
        category: 'Fachada',
        description: 'Fachada principal bioclimática con aleros de control solar y materiales nobles.',
        order_index: 1
      },
      {
        id: 'r_ibiza_2',
        title: 'Gran Salón Social & Doble Altura',
        storage_path: '/IBIZA A14/06-S2.jpg',
        category: 'Interiores',
        description: 'Espacio diáfano con doble altura y ventanales panorámicos de piso a techo.',
        order_index: 2
      },
      {
        id: 'r_ibiza_3',
        title: 'Terraza Lounge, Deck & Piscina',
        storage_path: '/IBIZA A14/03-F006.jpg',
        category: 'Zonas Comunes',
        description: 'Oasis exterior con solárium, espejo de agua y pérgola bioclimática.',
        order_index: 3
      },
      {
        id: 'r_ibiza_4',
        title: 'Cocina de Chef con Isla',
        storage_path: '/IBIZA A14/08-C01.jpg',
        category: 'Interiores',
        description: 'Cocina gourmet de alta gama con isla monolítica y barra social.',
        order_index: 4
      }
    ],
    rooms: {
      room_ibiza_1: {
        id: 'room_ibiza_1',
        name: 'SALA SOCIAL & DOBLE ALTURA',
        description: 'Espacio diáfano principal con ventilación cruzada y visual hacia el jardín',
        imageUrl: '', // Pega aquí la URL de la esfera 360 de la Sala
        minimapPosition: { x: 50, y: 50 },
        hotspots: [
          {
            id: 'h_ibiza_1_to_2',
            position: [400, 0, 100],
            targetRoom: 'room_ibiza_2',
            label: 'Ir a Cocina Gourmet'
          },
          {
            id: 'h_ibiza_1_to_3',
            position: [-100, 0, 400],
            targetRoom: 'room_ibiza_3',
            label: 'Ir a Terraza & Piscina'
          }
        ]
      },
      room_ibiza_2: {
        id: 'room_ibiza_2',
        name: 'COCINA GOURMET & COMEDOR',
        description: 'Cocina abierta con isla central y área de comedor social',
        imageUrl: '', // Pega aquí la URL de la esfera 360 de la Cocina
        minimapPosition: { x: 70, y: 50 },
        hotspots: [
          {
            id: 'h_ibiza_2_to_1',
            position: [-400, 0, -100],
            targetRoom: 'room_ibiza_1',
            label: 'Volver a Sala Social'
          }
        ]
      },
      room_ibiza_3: {
        id: 'room_ibiza_3',
        name: 'TERRAZA APERGOLADA & PISCINA',
        description: 'Deck exterior con solárium húmedo, BBQ y jardín perimetral',
        imageUrl: '', // Pega aquí la URL de la esfera 360 de la Terraza
        minimapPosition: { x: 30, y: 30 },
        hotspots: [
          {
            id: 'h_ibiza_3_to_1',
            position: [100, 0, -400],
            targetRoom: 'room_ibiza_1',
            label: 'Entrar a Sala Social'
          }
        ]
      },
      room_ibiza_4: {
        id: 'room_ibiza_4',
        name: 'MASTER SUITE & BALCÓN',
        description: 'Alcoba principal en segundo nivel con terraza privada',
        imageUrl: '', // Pega aquí la URL de la esfera 360 de la Habitación Principal
        minimapPosition: { x: 45, y: 70 },
        hotspots: [
          {
            id: 'h_ibiza_4_to_5',
            position: [350, 0, 0],
            targetRoom: 'room_ibiza_5',
            label: 'Entrar a Baño Spa'
          }
        ]
      },
      room_ibiza_5: {
        id: 'room_ibiza_5',
        name: 'BAÑO SPA PRINCIPAL',
        description: 'Baño de autor con vestidor integrado y luz natural',
        imageUrl: '', // Pega aquí la URL de la esfera 360 del Baño Principal
        minimapPosition: { x: 75, y: 70 },
        hotspots: [
          {
            id: 'h_ibiza_5_to_4',
            position: [-350, 0, 0],
            targetRoom: 'room_ibiza_4',
            label: 'Volver a Habitación'
          }
        ]
      }
    }
  },

  'project_hacienda_f22': {
    id: 'project_hacienda_f22',
    name: 'HACIENDA F22',
    tagline: 'Residencia campestre de alto estándar en Hacienda • Lote F22',
    category: 'villa',
    categoryLabel: 'Residencia Campestre Luxury',
    location: 'Cúcuta / Norte de Santander',
    zone: 'Condominio Hacienda • Lote F22',
    areaBuilt: '560 m²',
    areaLot: '1.200 m² (Lote F22)',
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    priceCOP: 'Inversión Privada',
    priceUSD: 'Dossier Confidencial',
    status: 'disponible',
    statusLabel: 'Proyecto Ejecutivo Aprobado',
    progress: 25,
    hasTour360: true,
    featured: true,
    heroImage: '/HACIENDA F22/FACHADA.png',
    thumbnail: '/HACIENDA F22/FACHADA.png',
    minimapImage: '/PLANO.jpg',
    initialRoomId: 'room_hacienda_1',
    tourType: '360_spheres',
    highlights: [
      'Colección completa de 33 renders arquitectónicos fotorrealistas (diurnos, nocturnos y aéreos)',
      'Perspectiva aérea monumental con dron capturando la volumetría y el entorno de golf',
      'Piscina turquesa con jacuzzi integrado y muros en travertino retroiluminado',
      'Gran salón social con doble altura monumental y escalera flotante en madera',
      'Cocina de chef con isla monolítica en cuarcita exótica y vitrina de vinos',
      'Pabellón exterior cubierto con quincho BBQ y living lounge apergolado',
      'Master suite presidencial con vestier boutique en vidrio ahumado y baño spa'
    ],
    description: 'Obra de autor con impronta escultórica en Condominio Hacienda. Diálogo entre volúmenes puros en concreto arquitectónico, maderas nobles y grandes paños vidriados.',
    galleryImages: [
      '/HACIENDA F22/FACHADA.png',
      '/HACIENDA F22/FACHADA DRON.png',
      '/HACIENDA F22/FACHADA NOCHE.png',
      '/HACIENDA F22/SALA.jpg',
      '/HACIENDA F22/PISCINA.jpg',
      '/HACIENDA F22/COCINA.jpg',
      '/HACIENDA F22/DORMITORIO.jpg',
      '/HACIENDA F22/TERRAZA.png'
    ],
    renders: [
      { id: 'h22-r-dron', title: 'Vista Aérea Panorámica Dron & Entorno', storage_path: '/HACIENDA F22/FACHADA DRON.png', category: 'Fachada', description: 'Toma aérea monumental con dron mostrando implantación, piscina y paisaje.', order_index: 1 },
      { id: 'h22-r-1', title: 'Fachada Principal & Emblema F22', storage_path: '/HACIENDA F22/FACHADA.png', category: 'Fachada', description: 'Volumetría monumental en piedra sinterizada e iluminación cálida.', order_index: 2 },
      { id: 'h22-r-2', title: 'Perspectiva Escultórica Frontal', storage_path: '/HACIENDA F22/FACHADA 2.png', category: 'Fachada', description: 'Geometría pura de volúmenes desfasados y celosías.', order_index: 3 },
      { id: 'h22-r-3', title: 'Iluminación Crepuscular & Paisajismo', storage_path: '/HACIENDA F22/FACHADA 3.png', category: 'Fachada', description: 'Diseño lumínico rasante al atardecer.', order_index: 4 },
      { id: 'h22-r-n1', title: 'Fachada Nocturna & Iluminación Escénica', storage_path: '/HACIENDA F22/FACHADA NOCHE.png', category: 'Fachada', description: 'Iluminación cálida 2700K y relieve arquitectónico nocturno.', order_index: 5 },
      { id: 'h22-r-n2', title: 'Perspectiva Nocturna Frontal', storage_path: '/HACIENDA F22/FACHADA NOCHE 2.png', category: 'Fachada', description: 'Composición nocturna con diálogo con el cielo estrellado.', order_index: 6 },
      { id: 'h22-r-4', title: 'Fachada Posterior & Apertura al Patio', storage_path: '/HACIENDA F22/FACHADA TRASERA.jpg', category: 'Fachada', description: 'Grandes paños acristalados hacia la piscina.', order_index: 7 },
      { id: 'h22-r-5', title: 'Perspectiva Posterior & Deck Superior', storage_path: '/HACIENDA F22/FACHADA TRASERA 2.jpg', category: 'Fachada', description: 'Vista diagonal de terrazas y entorno natural.', order_index: 8 },
      { id: 'h22-r-6', title: 'Atrio y Vestíbulo de Acceso', storage_path: '/HACIENDA F22/VESTIBULO.jpg', category: 'Interiores', description: 'Pórtico monumental con puerta pivotante.', order_index: 9 },
      { id: 'h22-r-7', title: 'Gran Salón Monumental & Doble Altura', storage_path: '/HACIENDA F22/SALA.jpg', category: 'Interiores', description: 'Salón con sofá bouclé y escalera flotante en madera.', order_index: 10 },
      { id: 'h22-r-8', title: 'Cocina de Chef con Isla de Cuarcita', storage_path: '/HACIENDA F22/COCINA.jpg', category: 'Interiores', description: 'Isla en cuarcita exótica y lámpara escultórica.', order_index: 11 },
      { id: 'h22-r-9', title: 'Piscina Turquesa & Muros de Travertino', storage_path: '/HACIENDA F22/PISCINA.jpg', category: 'Zonas Comunes', description: 'Piscina desbordante con jacuzzi y muros retroiluminados.', order_index: 12 },
      { id: 'h22-r-10', title: 'Pabellón Gourmet / Quincho de Chef', storage_path: '/HACIENDA F22/TERRAZA.png', category: 'Zonas Comunes', description: 'Cocina exterior cubierta con asador BBQ empotrado.', order_index: 13 },
      { id: 'h22-r-11', title: 'Family Lounge & Media Room', storage_path: '/HACIENDA F22/SALA TV.jpg', category: 'Interiores', description: 'Ambiente íntimo con panelado en roble acústico.', order_index: 14 },
      { id: 'h22-r-12', title: 'Master Suite Presidencial', storage_path: '/HACIENDA F22/DORMITORIO.jpg', category: 'Interiores', description: 'Habitación principal con luz lineal 2700K y terraza.', order_index: 15 },
      { id: 'h22-r-13', title: 'Walk-in Closet Presidencial', storage_path: '/HACIENDA F22/VESTIER.jpg', category: 'Interiores', description: 'Vestier tipo boutique en vidrio ahumado.', order_index: 16 },
      { id: 'h22-r-14', title: 'Master Bath & Spa', storage_path: '/HACIENDA F22/BANO.jpg', category: 'Interiores', description: 'Baño principal en mármol con doble lavamanos flotante.', order_index: 17 }
    ],
    rooms: {
      room_hacienda_1: {
        id: 'room_hacienda_1',
        name: 'ATRIO DE ACCESO & ESPEJO DE AGUA',
        description: 'Llegada principal con lámina de agua y puerta pivotante monumental',
        imageUrl: '/HACIENDA F22/VESTIBULO.jpg',
        minimapPosition: { x: 50, y: 20 },
        hotspots: [
          {
            id: 'h_hacienda_1_to_2',
            position: [0, 0, 450],
            targetRoom: 'room_hacienda_2',
            label: 'Ingresar al Gran Salón'
          }
        ]
      },
      room_hacienda_2: {
        id: 'room_hacienda_2',
        name: 'GRAN SALÓN & COMEDOR INTEGRADO',
        description: 'Área social con doble altura, chimenea escultórica y visual a la piscina',
        imageUrl: '/HACIENDA F22/SALA.jpg',
        minimapPosition: { x: 50, y: 50 },
        hotspots: [
          {
            id: 'h_hacienda_2_to_1',
            position: [0, 0, -450],
            targetRoom: 'room_hacienda_1',
            label: 'Volver a Entrada'
          },
          {
            id: 'h_hacienda_2_to_3',
            position: [400, 0, 100],
            targetRoom: 'room_hacienda_3',
            label: 'Ir a Piscina Infinity'
          }
        ]
      },
      room_hacienda_3: {
        id: 'room_hacienda_3',
        name: 'DECK EXTERIOR & PISCINA INFINITY',
        description: 'Terraza lounge al aire libre con asador de chef y desborde de agua',
        imageUrl: '/HACIENDA F22/PISCINA.jpg',
        minimapPosition: { x: 80, y: 50 },
        hotspots: [
          {
            id: 'h_hacienda_3_to_2',
            position: [-400, 0, -100],
            targetRoom: 'room_hacienda_2',
            label: 'Entrar al Salón'
          }
        ]
      },
      room_hacienda_4: {
        id: 'room_hacienda_4',
        name: 'SUITE PRESIDENCIAL',
        description: 'Master suite con doble vestidor walk-in y baño panorámico',
        imageUrl: '/HACIENDA F22/DORMITORIO.jpg',
        minimapPosition: { x: 30, y: 70 },
        hotspots: [
          {
            id: 'h_hacienda_4_to_5',
            position: [0, 200, 400],
            targetRoom: 'room_hacienda_5',
            label: 'Subir a Terraza Rooftop'
          }
        ]
      },
      room_hacienda_5: {
        id: 'room_hacienda_5',
        name: 'ROOFTOP & MIRADOR 360°',
        description: 'Cubierta apergolada con vista panorámica, fire pit y zona de estrellas',
        imageUrl: '/HACIENDA F22/FACHADA DRON.png',
        minimapPosition: { x: 50, y: 85 },
        hotspots: [
          {
            id: 'h_hacienda_5_to_4',
            position: [0, -200, -400],
            targetRoom: 'room_hacienda_4',
            label: 'Bajar a Suite'
          }
        ]
      }
    }
  }
};

export const CANONICAL_PROJECT_ORDER = [
  'project_hacienda_f22',
  'project_ibiza_a14',
  'project_1781963945215',
  'project_1782912175010',
];

/**
 * Resuelve el ID canónico de un proyecto a partir de un ID o slug alias.
 */
export function resolveCanonicalProjectId(id?: string): string {
  if (!id) return 'project_hacienda_f22';
  if (id === 'hacienda-f22' || id === 'project_hacienda_f22') return 'project_hacienda_f22';
  if (id === 'ibiza-a14' || id === 'project_ibiza_a14') return 'project_ibiza_a14';
  if (id === 'edinson-jejen' || id === 'project_1781963945215') return 'project_1781963945215';
  if (id === 'marquimoda' || id === 'project_1782912175010') return 'project_1782912175010';
  return id;
}

/**
 * Normaliza un objeto proyecto recibido desde Supabase o almacenamiento local,
 * asegurando integridad defensiva de todos sus campos comerciales, de renders y de tour 3D.
 */
export function normalizeProject(raw: any): Project {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `proj_${Date.now()}`,
      name: 'Nuevo Proyecto MASSA',
      description: 'Descripción del proyecto.',
      thumbnail: '',
      minimapImage: '',
      initialRoomId: 'room_1',
      rooms: {
        room_1: {
          id: 'room_1',
          name: 'Sala Principal',
          description: '',
          imageUrl: '',
          hotspots: [],
          minimapPosition: { x: 50, y: 50 }
        }
      }
    };
  }

  const id = String(raw.id || `proj_${Date.now()}`);
  const name = String(raw.name || 'Proyecto Sin Nombre');
  const description = String(raw.description || '');
  const thumbnail = String(raw.thumbnail || raw.heroImage || '');
  const minimapImage = String(raw.minimapImage || '');

  // Normalizar habitaciones
  const rawRooms = raw.rooms && typeof raw.rooms === 'object' ? raw.rooms : {};
  const rooms: Record<string, Room> = {};

  for (const [roomId, rVal] of Object.entries(rawRooms)) {
    if (!rVal || typeof rVal !== 'object') continue;
    const roomData = rVal as any;
    const hotspots: Hotspot[] = Array.isArray(roomData.hotspots)
      ? roomData.hotspots
          .filter((h: any) => h && typeof h === 'object')
          .map((h: any, idx: number) => ({
            id: String(h.id || `hotspot_${idx}`),
            position: [
              Number(h.position?.[0]) || 0,
              Number(h.position?.[1]) || 0,
              Number(h.position?.[2]) || 0
            ] as [number, number, number],
            targetRoom: String(h.targetRoom || ''),
            label: String(h.label || '')
          }))
      : [];

    rooms[roomId] = {
      id: roomId,
      name: String(roomData.name || 'Ambiente'),
      description: String(roomData.description || ''),
      imageUrl: String(roomData.imageUrl || ''),
      minimapPosition: {
        x: typeof roomData.minimapPosition?.x === 'number' ? roomData.minimapPosition.x : 50,
        y: typeof roomData.minimapPosition?.y === 'number' ? roomData.minimapPosition.y : 50
      },
      hotspots
    };
  }

  // Asegurar al menos 1 habitación si no hay ninguna
  if (Object.keys(rooms).length === 0) {
    rooms['room_1'] = {
      id: 'room_1',
      name: 'Ambiente Principal',
      description: '',
      imageUrl: '',
      hotspots: [],
      minimapPosition: { x: 50, y: 50 }
    };
  }

  const roomKeys = Object.keys(rooms);
  const initialRoomId = raw.initialRoomId && rooms[raw.initialRoomId]
    ? raw.initialRoomId
    : (roomKeys[0] || 'room_1');

  // Normalizar renders
  const renders: ProjectRenderItem[] = Array.isArray(raw.renders)
    ? raw.renders.map((r: any, i: number) => ({
        id: String(r.id || `render_${i}`),
        title: String(r.title || `Render ${i + 1}`),
        storage_path: String(r.storage_path || r.url || ''),
        category: (r.category as any) || 'Fachada',
        description: r.description ? String(r.description) : undefined,
        order_index: typeof r.order_index === 'number' ? r.order_index : i + 1
      }))
    : [];

  return {
    id,
    name,
    description,
    thumbnail,
    minimapImage,
    initialRoomId,
    rooms,
    pin: raw.pin,
    status: raw.status || 'disponible',
    statusLabel: raw.statusLabel || 'Disponible para Construcción',
    clientName: raw.clientName || '',
    phase: raw.phase || 'Fase 1: Diseño & Venta',
    progress: typeof raw.progress === 'number' ? raw.progress : 0,

    // Campos comerciales enriquecidos
    tagline: raw.tagline || 'Exclusiva residencia de autor por MASSA GROUP',
    category: raw.category || 'villa',
    categoryLabel: raw.categoryLabel || 'Villa Campestre',
    location: raw.location || 'Valle del Cauca, Colombia',
    zone: raw.zone || 'Zona Exclusiva',
    areaBuilt: raw.areaBuilt || '450 m²',
    areaLot: raw.areaLot || undefined,
    bedrooms: typeof raw.bedrooms === 'number' ? raw.bedrooms : 4,
    bathrooms: typeof raw.bathrooms === 'number' ? raw.bathrooms : 5,
    parkingSpaces: typeof raw.parkingSpaces === 'number' ? raw.parkingSpaces : 3,
    priceCOP: raw.priceCOP || '$1.800.000.000 COP',
    priceUSD: raw.priceUSD || '~$450.000 USD',
    hasTour360: raw.hasTour360 ?? (Object.keys(rooms).length > 0),
    featured: raw.featured ?? false,
    heroImage: raw.heroImage || raw.thumbnail || (id === 'project_1781963945215' ? '/images/projects/edinson_jejen_terraza.jpg' : id === 'project_1782912175010' ? '/images/projects/marquimoda_isometria.webp' : ''),
    galleryImages: Array.isArray(raw.galleryImages) && raw.galleryImages.length > 0 
      ? raw.galleryImages 
      : (id === 'project_1781963945215' ? ['/images/projects/edinson_jejen_terraza.jpg'] : id === 'project_1782912175010' ? ['/images/projects/marquimoda_isometria.webp'] : []),
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [
      'Diseño bioclimático pasivo de alto confort térmico',
      'Piscina infinity con borde desbordante',
      'Espacios diáfanos a doble altura con carpintería hermética',
      'Acabados en concreto visto arquitectónico y madera noble'
    ],
    renders,
    tourType: raw.tourType || '360_spheres',
    tourEmbedUrl: raw.tourEmbedUrl ? String(raw.tourEmbedUrl) : undefined
  };
}
